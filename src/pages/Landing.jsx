import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import RecipeBook from '../components/RecipeBook';
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
      <header className="max-w-4xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold tracking-widest mb-6">
          <ChefHat className="w-4 h-4" />
          SE FIRE RECIPES
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
          Cook something{' '}
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            great tonight.
          </span>
        </h1>
        <p className="text-white/60 text-lg mt-4">
          Save your favorites, discover new ones. Your kitchen, your rules.
        </p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Recipes" />
          </div>
      </header>

      <RecipeBook />

      <div className="border-t border-white/10">
        <MusicSection />
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <ShareButtons title="Se Fire Recipes — Cook something great tonight." />
      </div>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-white/40 text-sm">© 2026 Se Fire Tech</p>
        <Link to="/disclaimer" className="text-white/40 text-sm underline hover:text-white/70 transition">
          Disclaimer
        </Link>
      </footer>
    </div>
  );
}
