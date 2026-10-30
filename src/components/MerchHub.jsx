import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Play, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

// Track bundles — buy outright or rent monthly. Edit tracks/pricing here.
export const BUNDLES = [
  {
    id: 'bundle-street',
    name: 'Street Essentials',
    buyPrice: 15,
    rentPrice: 5,
    currency: 'USD',
    tracks: [
      'NOW I SEE THA REAPER',
      'Car Banger',
      'Cruzin Tha Block',
      'Chillin In Tha Studio',
      'Club Hopper',
      'Midnight Run',
    ],
    tag: 'Best seller',
  },
  {
    id: 'bundle-vibes',
    name: 'Late Night Vibes',
    buyPrice: 15,
    rentPrice: 5,
    currency: 'USD',
    tracks: [
      'Chillin In Tha Studio',
      'Neon Dreams',
      'After Hours',
      'Slow Burn',
      'City Lights',
      'Last Call',
    ],
    tag: 'New',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 },
};

// Stripe not connected yet — checkout in demo mode.
const STRIPE_CONNECTED = false;

export default function MerchHub() {
  const [previewing, setPreviewing] = useState(null);
  const [tiers, setTiers] = useState({}); // bundleId -> 'buy' | 'rent'

  const getTier = (bundleId) => tiers[bundleId] || 'buy';
  const setTier = (bundleId, tier) => setTiers((t) => ({ ...t, [bundleId]: tier }));

  const isFounder = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('founder') === 'sefire2026') {
        localStorage.setItem('sfi:founder', 'true');
        const url = new URL(window.location.href);
        url.searchParams.delete('founder');
        window.history.replaceState({}, '', url.toString());
      }
      return localStorage.getItem('sfi:founder') === 'true';
    } catch { return false; }
  };

  const handleBuy = (bundle) => {
    const tier = getTier(bundle.id);
    if (isFounder()) {
      toast.success(`Founder access — "${bundle.name}" (${tier}) is yours`);
      return;
    }
    if (!STRIPE_CONNECTED) {
      toast.info('Checkout coming soon — paid features are under maintenance.');
      return;
    }
    // TODO: wire to Stripe checkout when keys are available
    toast.info(`Redirecting to checkout…`);
  };

  const handlePreview = (bundleId, track) => {
    setPreviewing(previewing === `${bundleId}:${track}` ? null : `${bundleId}:${track}`);
    // Preview plays via Spotify embed on the main music section
    document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
    toast.info(`Previewing "${track}" — full track on Spotify`);
  };

  return (
    <section id="merch" className="px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 px-3.5 py-1.5 text-xs font-medium text-orange-300">
            <ShoppingBag className="w-3.5 h-3.5" /> Merch Hub
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Own the music</h2>
          <p className="text-slate-500 mt-2">Bundle packs — buy for $15 or rent for $5/month. 6 tracks each.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {BUNDLES.map((bundle, i) => (
            <motion.div
              key={bundle.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-orange-400/40 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-black text-xl">{bundle.name}</div>
                  <div className="text-sm text-orange-300/80 mt-0.5">{bundle.tag}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-orange-400">
                    ${getTier(bundle.id) === 'buy' ? bundle.buyPrice : bundle.rentPrice}
                  </div>
                  <div className="text-xs text-slate-500">
                    {getTier(bundle.id) === 'buy' ? '6 tracks · yours forever' : '6 tracks · per month'}
                  </div>
                </div>
              </div>

              {/* Rent / Buy toggle */}
              <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-1 mb-5">
                {['buy', 'rent'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTier(bundle.id, tier)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                      getTier(bundle.id) === tier
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tier === 'buy' ? `Buy — $${bundle.buyPrice}` : `Rent — $${bundle.rentPrice}/mo`}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-5">
                {bundle.tracks.map((track, ti) => (
                  <div
                    key={ti}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2"
                  >
                    <span className="text-sm flex items-center gap-2">
                      <span className="text-slate-500 text-xs w-5">{ti + 1}.</span>
                      {track}
                    </span>
                    <button
                      onClick={() => handlePreview(bundle.id, track)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-orange-300 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuy(bundle)}
                disabled={!STRIPE_CONNECTED && !isFounder()}
                className={`w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition ${
                  STRIPE_CONNECTED || isFounder()
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                {!STRIPE_CONNECTED && !isFounder() && <Lock className="w-4 h-4" />}
                {isFounder() ? `Get free — Founder` : STRIPE_CONNECTED
                  ? getTier(bundle.id) === 'buy'
                    ? `Buy now — $${bundle.buyPrice}`
                    : `Rent now — $${bundle.rentPrice}/mo`
                  : 'Coming soon'}
              </button>
              <div className="mt-2 text-center text-xs text-slate-600 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                {getTier(bundle.id) === 'buy' ? 'Instant download · Yours forever' : 'Streaming access · Cancel anytime'}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp} className="text-center text-sm text-slate-600 mt-8 max-w-lg mx-auto">
          Physical merch (tees, hoodies, hats) dropping soon — talk to your silk screener and we'll list them here.
        </motion.p>
      </div>
    </section>
  );
}
