import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Lock, FolderLock, ShieldCheck, ChevronDown } from 'lucide-react'
import VaultApp from '../components/VaultApp'
import ProUpgrade from '../components/ProUpgrade'
import MusicSection from '../components/MusicSection'
import ShareButtons from '../components/ShareButtons'

export default function Landing() {
  const appRef = useRef(null)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-sm text-center px-4 py-2.5">
        Our apps are currently being upgraded and under maintenance — paid features don&apos;t work right now. Enjoy the full free demo!
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center px-4 pt-14 pb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 mb-6 shadow-lg shadow-amber-500/20">
          <Lock className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
          Se Fire Vault
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
          Your private notes vault with a PIN lock. Keep what matters secure — on your device, away from prying eyes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => appRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-xl bg-amber-400 text-black font-semibold px-6 py-3 hover:bg-amber-300 transition-colors"
          >
            Open Vault <ChevronDown className="w-4 h-4" />
          </button>
          <ProUpgrade appName="Se Fire Vault" />
        </div>
      </header>

      {/* App */}
      <main ref={appRef} className="max-w-4xl mx-auto px-4 pb-16 scroll-mt-6">
        <VaultApp />
      </main>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <Lock className="w-8 h-8 text-amber-300 mb-3" />
            <h3 className="font-bold mb-1">PIN lock</h3>
            <p className="text-sm text-zinc-400">
              A 4-digit PIN guards your vault. The PIN is hashed on your device and unlock never leaves this session.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <FolderLock className="w-8 h-8 text-amber-300 mb-3" />
            <h3 className="font-bold mb-1">Categories</h3>
            <p className="text-sm text-zinc-400">
              Organize notes into Personal, Work, Finance and more. Filter, search, and star your favorites.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <ShieldCheck className="w-8 h-8 text-amber-300 mb-3" />
            <h3 className="font-bold mb-1">Private &amp; local</h3>
            <p className="text-sm text-zinc-400">
              Everything stays in your browser&apos;s local storage. No accounts, no servers, no tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 max-w-4xl mx-auto px-4 py-10">
        <MusicSection />
        <div className="mt-8 flex flex-col items-center gap-4">
          <ShareButtons />
          <Link to="/disclaimer" className="text-sm text-zinc-500 hover:text-zinc-300 underline">
            Disclaimer
          </Link>
        </div>
      </footer>
    </div>
  )
}
