import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Check, Clock, Flame } from 'lucide-react';
import { APPS } from '../data/apps';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';

export default function AppDetail() {
  const { id } = useParams();
  const app = APPS.find((a) => a.id === id);
  useEffect(() => { checkFounderUrl(); }, []);

  if (!app) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          🔨 This app is under construction — in no way, shape, or form is the pay option supposed to work right now.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> All apps
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'live' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {app.status === 'live' ? '● LIVE NOW' : '◐ DEPLOYING OCT 31'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{app.category}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-2">{app.name}</h1>
          <p className="text-xl text-orange-300/80 mb-6">{app.tagline}</p>
          <p className="text-slate-300 leading-relaxed mb-8">{app.description}</p>

          <h2 className="text-lg font-bold mb-4">Features</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {app.features.map((f) => (
              <div key={f} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>

          {app.url ? (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
            >
              Launch {app.name} <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/5 border border-white/10 text-slate-400">
              <Clock className="w-4 h-4" /> Deploying Oct 31
            </div>
          )}
        </motion.div>
      </div>

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title={`${app.name} — ${app.tagline} | Se Fire Tech`} />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <Link to="/disclaimer" className="underline hover:text-slate-300">Disclaimer</Link>
        </p>
      </footer>
    </div>
  );
}
