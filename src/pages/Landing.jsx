import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, Music2, Play, Bell, ArrowRight, Sparkles,
  Disc3, Mic2, Radio, Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import MerchHub from '../components/MerchHub';

const TRACKS = [
  { title: 'NOW I SEE THA REAPER', tag: 'Latest heat', icon: '🔥' },
  { title: 'Car Banger', tag: 'Fan favorite', icon: '🚗' },
  { title: 'Cruzin Tha Block', tag: 'Street anthem', icon: '🛣️' },
  { title: 'Chillin In Tha Studio', tag: 'Vibes', icon: '🎙️' },
  { title: 'Club Hopper', tag: 'Party starter', icon: '🪩' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 },
};

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Enter a valid email');
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem('sefire:notify') || '[]');
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('sefire:notify', JSON.stringify(list));
      }
      toast.success("You're on the list — you'll hear new drops first.");
      setEmail('');
    } catch {
      toast.success("You're on the list.");
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
              <Flame className="w-5 h-5 text-white" />
            </span>
            <span className="font-bold text-lg tracking-tight">Se Fire</span>
            <span className="hidden sm:inline text-xs text-slate-500 border border-white/10 rounded-full px-2.5 py-1">Official Hub</span>
          </div>
          <a
            href="#merch"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-orange-300 transition"
          >
            <ShoppingBag className="w-4 h-4" /> Merch
          </a>
          <a
            href="https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1DB954] px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 transition"
          >
            <Play className="w-4 h-4" /> Follow
          </a>
        </div>
      </header>

      {/* Maintenance notice */}
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
            Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the music free.
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-orange-500/15 blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-red-500/10 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 px-3.5 py-1.5 text-xs font-medium text-orange-300">
              <Flame className="w-3.5 h-3.5" /> The fire behind Se Fire Tech
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-br from-orange-300 via-red-400 to-rose-500 bg-clip-text text-transparent"
          >
            SE FIRE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-slate-400 max-w-xl mx-auto"
          >
            Raw tracks. Real stories. Stream the music, follow the journey, join the movement.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1DB954] px-6 py-3 font-bold text-slate-950 hover:brightness-110 transition"
            >
              <Play className="w-5 h-5" /> Play on Spotify
            </a>
            <a
              href="#tracks"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10 transition"
            >
              <Disc3 className="w-5 h-5" /> Browse tracks
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured tracks */}
      <section id="tracks" className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight">Featured tracks</h2>
            <p className="text-slate-500 mt-2">The ones the streets keep replaying.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKS.map((t, i) => (
              <motion.a
                key={t.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                href="https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm"
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-orange-400/40 hover:bg-white/[0.06] transition"
              >
                <div className="text-4xl mb-3">{t.icon}</div>
                <div className="font-bold">{t.title}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-orange-300/80">
                  <Sparkles className="w-3 h-3" /> {t.tag}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400 group-hover:text-orange-300 transition">
                  <Play className="w-4 h-4" /> Listen
                </div>
              </motion.a>
            ))}
            <motion.a
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: TRACKS.length * 0.06 }}
              href="https://open.spotify.com/artist/0pvxsVN3Cj3MochJhfROvm"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-dashed border-white/15 p-5 grid place-items-center text-slate-500 hover:text-orange-300 hover:border-orange-400/40 transition min-h-[160px]"
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                Full catalog on Spotify <ArrowRight className="w-4 h-4" />
              </span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Music embed */}
      <section id="music" className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <MusicSection accent="orange" />
          </motion.div>
        </div>
      </section>

      {/* Merch hub */}
      <MerchHub />

      {/* About */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-8 text-center">
            <Mic2 className="w-10 h-10 mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl font-black tracking-tight">The artist behind the tech</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto leading-relaxed">
              Se Fire is the sound of the grind — tracks built in late-night sessions,
              stories from the block, energy for the club. The same fire that built
              Se Fire Tech lives in every bar.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Radio className="w-4 h-4 text-orange-400" /> Independent artist</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4 text-orange-400" /> Fan-powered</span>
              <span className="inline-flex items-center gap-1.5"><Music2 className="w-4 h-4 text-orange-400" /> New drops coming</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notify me */}
      <section className="px-4 py-12">
        <div className="max-w-xl mx-auto">
          <motion.div {...fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <Bell className="w-8 h-8 mx-auto text-orange-400 mb-3" />
            <h2 className="text-xl font-black">Never miss a drop</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">Get notified the second new music lands.</p>
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-orange-400/60 placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-3 text-sm font-bold hover:brightness-110 transition"
              >
                Notify me
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Share */}
      <section className="px-4 py-12">
        <div className="max-w-xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-xl font-black mb-1">Spread the fire</h2>
            <p className="text-sm text-slate-500 mb-5">One share puts Se Fire in front of someone new.</p>
            <ShareButtons />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-slate-300">Se Fire</span>
            <span>· a Se Fire Tech project</span>
          </div>
          <button onClick={() => navigate('/disclaimer')} className="hover:text-slate-300 transition">
            Disclaimer
          </button>
        </div>
      </footer>
    </div>
  );
}
