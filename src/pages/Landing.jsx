import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CloudSun } from 'lucide-react';
import WeatherDash from '../components/WeatherDash';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';
import ProUpgrade from '../components/ProUpgrade';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the full free demo!
        </p>
      </div>

      {/* Hero */}
      <header className="text-center px-4 pt-12 pb-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest text-orange-300">
          <CloudSun size={14} />
          SE FIRE WEATHER
        </div>
        <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-tight">
          Your forecast. <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">At a glance.</span>
        </h1>
        <p className="mt-4 text-white/60 text-base sm:text-lg">
          Live weather powered by Open-Meteo. No sign-up, no fees.
        </p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Weather" />
          </div>
      </header>

      {/* Dashboard */}
      <main className="pb-12">
        <WeatherDash />
      </main>

      {/* Music */}
      <section className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <MusicSection accent="orange" />
        </div>
      </section>

      {/* Share */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <ShareButtons title="Se Fire Weather — Your forecast at a glance." />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/40">
        <p>© 2026 Se Fire Tech</p>
        <Link to="/disclaimer" className="underline hover:text-white/70 mt-1 inline-block">
          Disclaimer
        </Link>
      </footer>
    </div>
  );
}
