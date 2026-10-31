import { useState, useEffect } from 'react';
import { Crown, X, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Standardized Pro upgrade component for all Se Fire Tech apps
// - Shows pricing tiers
// - Integrates with /api/checkout when Stripe is configured
// - Founder bypass via ?founder=sefire2026

const PLANS = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$4.99',
    period: '/month',
    features: ['All features unlocked', 'Priority support', 'No ads', 'Cloud sync'],
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: '$49.99',
    period: '/year',
    features: ['Everything in Monthly', '2 months free', 'Early access', 'Exclusive themes'],
    highlight: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99.99',
    period: 'one-time',
    features: ['Pay once, own forever', 'All future updates', 'VIP support', 'Founder badge'],
  },
];

export function isFounder() {
  try {
    return localStorage.getItem('sfi:founder') === 'true';
  } catch {
    return false;
  }
}

export default function ProUpgrade({ appName = 'this app' }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);
  const founder = isFounder();

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => setStripeReady(d.stripe_configured))
      .catch(() => setStripeReady(false));
  }, []);

  const handleUpgrade = async (plan) => {
    if (founder) {
      toast.success('Founder access — all Pro features unlocked! 👑');
      setShowModal(false);
      return;
    }
    if (!stripeReady) {
      toast.info('Payments coming soon — enjoy Pro free during construction! 🚧');
      setShowModal(false);
      return;
    }
    setLoading(plan.id);
    try {
      const amounts = { monthly: 4.99, yearly: 49.99, lifetime: 99.99 };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amounts[plan.id],
          name: `${appName} — ${plan.name}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Checkout failed. Please try again.');
      }
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (founder) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition text-sm"
      >
        <Crown className="w-4 h-4" /> Go Pro
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="bg-[#14141a] border border-white/10 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" /> Go Pro
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Unlock the full power of {appName}. {stripeReady ? 'Choose your plan:' : 'Payments launching soon — lock in early pricing.'}
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-5 ${plan.highlight ? 'border-amber-400/50 bg-amber-400/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}
                >
                  {plan.highlight && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 mb-3 inline-block">
                      BEST VALUE
                    </span>
                  )}
                  <h3 className="font-bold mb-1">{plan.name}</h3>
                  <p className="mb-4">
                    <span className="text-2xl font-black">{plan.price}</span>
                    <span className="text-xs text-slate-500"> {plan.period}</span>
                  </p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading === plan.id}
                    className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 transition disabled:opacity-50"
                  >
                    {loading === plan.id ? 'Loading...' : 'Choose'}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-slate-600 mt-6 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" /> Secure checkout via Stripe
            </p>
          </div>
        </div>
      )}
    </>
  );
}
