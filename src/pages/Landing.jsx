import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Lock } from 'lucide-react';
import JournalApp from '../components/JournalApp';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import ProUpgrade from '../components/ProUpgrade';

const FEATURES = [
  {
    icon: Heart,
    title: 'Daily moods',
    text: 'Tag every entry with how you felt — track your emotional journey over time.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar view',
    text: 'See your whole writing history at a glance and jump to any day in one tap.',
  },
  {
    icon: Lock,
    title: 'Private & local',
    text: 'Your journal lives only on your device. No accounts, no cloud, no one else reading it.',
  },
];

export default function Landing() {
  const scrollToApp = () => {
    document.getElementById('journal-app')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500/90 px-4 py-2.5 text-center text-xs font-medium text-black sm:text-sm">
        Our apps are currently being upgraded and under maintenance — paid features don&apos;t work
        right now. Enjoy the full free demo!
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-5xl px-4 pb-10 pt-14 text-center sm:pt-20">
        <h1 className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-5xl font-extrabold text-transparent sm:text-7xl">
          Se Fire Journal
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-300 sm:text-lg">
          A private daily journal with moods, a calendar, and search. Write a little every day —
          your story matters.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={scrollToApp}
            className="rounded-full bg-amber-500 px-7 py-3 font-semibold text-black shadow-lg transition hover:bg-amber-400"
          >
            Start Writing
          </button>
          <ProUpgrade appName="Se Fire Journal" />
        </div>
      </header>

      {/* App */}
      <main id="journal-app" className="mx-auto max-w-6xl scroll-mt-6 px-4 pb-16">
        <JournalApp />
      </main>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <f.icon size={28} className="mx-auto text-amber-400" />
              <h3 className="mt-3 font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <MusicSection />
          <div className="mt-8 flex flex-col items-center gap-4">
            <ShareButtons />
            <Link to="/disclaimer" className="text-sm text-gray-400 underline hover:text-gray-200">
              Disclaimer
            </Link>
            <p className="text-xs text-gray-600">© 2026 Se Fire Tech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
