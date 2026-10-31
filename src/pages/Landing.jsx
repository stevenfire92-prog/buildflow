import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import ServicesGrid from '../components/ServicesGrid';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import ProUpgrade from '../components/ProUpgrade';
import { checkFounderUrl } from '../lib/founder';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Under construction banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          🔨 This app is under construction — in no way, shape, or form is the pay option supposed to work right now. Browse free.
        </p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-6">
              <Flame className="w-3.5 h-3.5" /> SE FIRE TECH
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
              We build <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">everything digital</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Websites, apps, games, software, music & books — professional quality at prices that beat the competition. Built to have a positive impact.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#services" className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition flex items-center gap-2">
                Browse services <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#music" className="px-8 py-3.5 rounded-xl font-bold border border-white/15 hover:border-orange-400/40 transition">
                Listen to Se Fire
              </a>
            </div>
            <div className="mt-4">
              <ProUpgrade appName="Se Fire Promo" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Services */}
      <div id="services">
        <ServicesGrid />
      </div>

      {/* Music */}
      <div id="music" className="border-t border-white/5">
        <MusicSection />
      </div>

      {/* Share */}
      <div className="max-w-6xl mx-auto px-4 py-12 border-t border-white/5">
        <ShareButtons title="Se Fire Tech — We build everything digital" />
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a> · stevenfire92@gmail.com
        </p>
      </footer>
    </div>
  );
}
