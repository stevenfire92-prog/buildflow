import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe2, Zap, BarChart3, Link2, Target, ShieldCheck,
  ArrowRight, Check, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';

const FEATURES = [
  { icon: BarChart3, title: 'Live revenue dashboard', text: 'Gross volume, MRR, sales streaks and every payment — live from Stripe, beautifully visualized.' },
  { icon: Link2, title: 'Payment links in seconds', text: 'Turn any product into a shareable checkout link. Sell in DMs, posts, emails — no website needed.' },
  { icon: Target, title: 'Revenue goals that pull you forward', text: 'Set targets, watch the rings fill, and get a confetti storm when you hit them.' },
  { icon: Zap, title: 'Products & subscriptions', text: 'Create one-time products and recurring plans directly — synced straight to Stripe.' },
  { icon: Globe2, title: 'Global by default', text: '135+ currencies, international cards and payouts. Sell anywhere, get paid everywhere.' },
  { icon: ShieldCheck, title: 'Your keys, your money', text: 'Connects to your own Stripe account. Funds go to you — GlobePay never touches them.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 },
};

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
              <Globe2 className="w-5 h-5 text-slate-950" />
            </span>
            <span className="font-bold text-lg tracking-tight">GlobePay</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-300">Sign in</Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold">
              Start free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" /> Monetize everything, everywhere
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]"
          >
            Turn anything you make<br />
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">into money.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
          >
            GlobePay is the global monetization hub for creators and builders. Products, subscriptions,
            payment links and a live revenue dashboard — powered by your Stripe account.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-bold text-base px-8">
              Start monetizing free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')} className="border-white/15 text-base px-8">
              See the dashboard
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-xs text-slate-500">
            Free to start · Your Stripe account · Your money
          </motion.p>
        </div>
      </section>

      {/* Mock dashboard strip */}
      <motion.section {...fadeUp} className="px-4 pb-20">
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 md:p-8 shadow-2xl shadow-emerald-500/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Gross volume', value: '$12,845' },
              { label: 'Sales', value: '342' },
              { label: 'MRR', value: '$4,299' },
              { label: 'Sales streak', value: '12 🔥' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-950/60 border border-white/10 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-300">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-slate-950/60 border border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm text-slate-300">Live payments stream in the moment they happen.</p>
            </div>
            <span className="text-sm font-bold text-emerald-300">+$149.00</span>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to get paid</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">One hub for every dollar your creations earn — built to keep you coming back.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}>
                <Card className="h-full border-white/10 bg-white/[0.03] hover:border-emerald-400/30 transition-colors">
                  <CardContent className="p-6">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 text-emerald-300">
                      <f.icon className="w-5 h-5" />
                    </span>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-3 text-slate-400">Start free. Upgrade when the money rolls in.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div {...fadeUp}>
              <Card className="h-full border-white/10 bg-white/[0.03]">
                <CardContent className="p-8">
                  <h3 className="font-bold text-lg">Starter</h3>
                  <p className="mt-1 text-4xl font-extrabold">$0</p>
                  <p className="text-sm text-slate-500">forever</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                    {['Live revenue dashboard', 'Unlimited products', 'Payment links', '3 revenue goals'].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-300" /> {t}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full mt-8 border-white/15">Start free</Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-full border-emerald-400/40 bg-gradient-to-b from-emerald-400/[0.08] to-white/[0.02] relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-1 text-[11px] font-bold text-slate-950">MOST POPULAR</span>
                <CardContent className="p-8">
                  <h3 className="font-bold text-lg">Pro</h3>
                  <p className="mt-1 text-4xl font-extrabold">$19<span className="text-base font-medium text-slate-500">/mo</span></p>
                  <p className="text-sm text-slate-500">pays for itself with one sale</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                    {['Everything in Starter', 'Instant sale alerts', 'Unlimited goals + streaks', 'Team seats', 'Priority support'].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-300" /> {t}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/dashboard')} className="w-full mt-8 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-bold">Go Pro</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Music + share */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
          <motion.div {...fadeUp}>
            <MusicSection />
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <ShareButtons title="GlobePay — Monetize everything" text="Monetize everything with GlobePay — products, payment links, live revenue dashboard." />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center rounded-2xl border border-emerald-400/25 bg-gradient-to-b from-emerald-400/[0.08] to-transparent p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your next dollar is waiting.</h2>
          <p className="mt-3 text-slate-400">Connect Stripe, create a product, share a link. Three steps to your first sale.</p>
          <Button size="lg" onClick={() => navigate('/dashboard')} className="mt-8 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-bold text-base px-10">
            Start monetizing <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold text-slate-300">GlobePay</span> · Monetize everything, everywhere.
          </div>
          <p>Payments processed securely by Stripe. GlobePay never holds your funds. <a href="/disclaimer" class="underline hover:text-slate-300">Disclaimer</a></p>
        </div>
      </footer>
    </div>
  );
}
