import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope, MessageSquareText, Eye, Rocket, LayoutTemplate,
  Zap, ShieldCheck, ArrowRight, Check, Sparkles, Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';

const FEATURES = [
  { icon: MessageSquareText, title: 'Describe it in words', text: 'No code, no drag-and-drop puzzles. Just tell Dr Build what you want like you\'d tell a developer.' },
  { icon: Eye, title: 'Watch it build live', text: 'See every step as it happens — layout, styling, content — with a live preview updating in real time.' },
  { icon: LayoutTemplate, title: '5 smart blueprints', text: 'Landing pages, dashboards, stores, portfolios, SaaS apps. Dr Build picks the right starting point automatically.' },
  { icon: Rocket, title: 'Publish in one click', text: 'Happy with it? Hit publish and it\'s saved to your apps, ready to share with the world.' },
  { icon: Zap, title: 'Real AI under the hood', text: 'Bring your own AI key in Settings and Dr Build generates truly custom apps — not just templates.' },
  { icon: ShieldCheck, title: 'Yours to keep', text: 'Every app you build is yours. No lock-in, no ransom, no "export fee".' },
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
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
              <Stethoscope className="w-5 h-5 text-white" />
            </span>
            <span className="font-bold text-lg tracking-tight">Dr Build AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/builder')} className="text-slate-300">Open builder</Button>
            <Button onClick={() => navigate('/builder')} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold">
              Build free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-36 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-500/15 blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3.5 py-1.5 text-xs font-medium text-violet-300">
              <Sparkles className="w-3.5 h-3.5" /> The super AI builder
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]"
          >
            Describe it.<br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">Dr Build ships it.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
          >
            The AI app builder that actually builds. Type what you want, watch it come
            together live, and publish with one click.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" onClick={() => navigate('/builder')} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-base px-8">
              Start building free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/templates')} className="border-white/15 text-base px-8">
              Browse templates
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-xs text-slate-500">
            Free to start · No code needed · Your apps, your property
          </motion.p>
        </div>
      </section>

      {/* Chat mock */}
      <motion.section {...fadeUp} className="px-4 pb-20">
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-2xl shadow-violet-500/5 space-y-3">
          <div className="flex justify-end">
            <div className="rounded-2xl bg-violet-500 px-4 py-2.5 text-sm max-w-[80%]">A landing page for my coffee shop</div>
          </div>
          <div className="flex gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </span>
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-sm max-w-[80%]">
              Love it. Building <b>Bean & Brew</b> as a landing page — watch this:
              <div className="mt-2 space-y-1 text-[13px]">
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-300" /> <span className="line-through text-slate-500">Analyzing your concept</span></div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-300" /> <span className="line-through text-slate-500">Designing hero section</span></div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-violet-300 border-t-transparent animate-spin" /> Writing copy that converts</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">An AI builder that feels like magic</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">Everything you need to go from idea to live app in minutes.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}>
                <Card className="h-full border-white/10 bg-white/[0.03] hover:border-violet-400/30 transition-colors">
                  <CardContent className="p-6">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 text-violet-300">
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

      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-3 text-slate-400">Start free. Upgrade when you're shipping.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div {...fadeUp}>
              <Card className="h-full border-white/10 bg-white/[0.03]">
                <CardContent className="p-8">
                  <h3 className="font-bold text-lg">Starter</h3>
                  <p className="mt-1 text-4xl font-extrabold">$0</p>
                  <p className="text-sm text-slate-500">forever</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                    {['10 AI builds / month', '5 blueprints', 'Live preview', 'Community support'].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-300" /> {t}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/builder')} variant="outline" className="w-full mt-8 border-white/15">Start free</Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-full border-violet-400/40 bg-gradient-to-b from-violet-400/[0.08] to-white/[0.02] relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-bold text-white">MOST POPULAR</span>
                <CardContent className="p-8">
                  <h3 className="font-bold text-lg">Pro</h3>
                  <p className="mt-1 text-4xl font-extrabold">$19<span className="text-base font-medium text-slate-500">/mo</span></p>
                  <p className="text-sm text-slate-500">for serious builders</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                    {['Unlimited AI builds', 'Real AI engine', 'Custom domains', 'Priority builds', 'Remove branding'].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-300" /> {t}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/builder')} className="w-full mt-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold">Go Pro</Button>
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
            <ShareButtons title="Dr Build AI — Describe it. Ship it." text="Build apps with AI: describe it, watch it build live, ship it. Try Dr Build AI free." />
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center rounded-2xl border border-violet-400/25 bg-gradient-to-b from-violet-400/[0.08] to-transparent p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your app is one sentence away.</h2>
          <p className="mt-3 text-slate-400">Tell Dr Build what you want. Watch it appear. Ship it.</p>
          <Button size="lg" onClick={() => navigate('/builder')} className="mt-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-base px-10">
            Build my app <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-violet-300" />
            <span className="font-semibold text-slate-300">Dr Build AI</span> · Describe it. Ship it.
          </div>
          <p>Your apps are your property. No lock-in, ever. <a href="/disclaimer" class="underline hover:text-slate-300">Disclaimer</a></p>
        </div>
      </footer>
    </div>
  );
}
