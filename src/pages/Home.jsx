import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { APPS, CATEGORIES } from '../data/apps';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';

export default function Home() {
  const [category, setCategory] = useState('All');
  useEffect(() => { checkFounderUrl(); }, []);

  const filtered = category === 'All' ? APPS : APPS.filter((a) => a.category === category);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          🔨 This hub is under construction — in no way, shape, or form is the pay option supposed to work right now.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-14 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-6">
            <Flame className="w-3.5 h-3.5" /> SE FIRE TECH
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">21 apps.</span> One fire.
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Every tool, every platform, every experience — built independent, built to last, built to have a positive impact.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${category === c ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:border-orange-400/40'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link
                to={`/app/${app.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-orange-400/40 transition h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${app.status === 'live' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                    {app.status === 'live' ? '● LIVE' : '◐ DEPLOYING'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{app.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{app.name}</h3>
                <p className="text-sm text-orange-300/80 mb-2">{app.tagline}</p>
                <p className="text-sm text-slate-400 line-clamp-2">{app.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-orange-400 font-semibold mt-4">
                  View details <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title="Se Fire Tech — 21 apps. One fire." />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <Link to="/disclaimer" className="underline hover:text-slate-300">Disclaimer</Link> · All apps 100% independent
        </p>
      </footer>
    </div>
  );
}
