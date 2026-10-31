import { Link } from 'react-router-dom'
import { Target, Milestone, TrendingUp, PartyPopper, ChevronDown } from 'lucide-react'
import GoalsApp from '../components/GoalsApp'
import MusicSection from '../components/MusicSection'
import ShareButtons from '../components/ShareButtons'
import ProUpgrade from '../components/ProUpgrade'

export default function Landing() {
  const scrollToApp = () => {
    document.getElementById('goals-app')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500/15 px-4 py-2.5 text-center text-sm font-medium text-amber-200">
        🚧 Our apps are currently being upgraded and under maintenance — paid features don't work
        right now. Enjoy the full free demo!
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-4xl px-4 pb-8 pt-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-4xl shadow-lg shadow-orange-500/30">
          🎯
        </div>
        <h1 className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
          Se Fire Goals
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
          Set goals, break them into milestones, and celebrate every win. Big dreams become daily
          progress.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={scrollToApp}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
          >
            <Target className="h-5 w-5" /> Set a Goal
          </button>
          <ProUpgrade appName="Se Fire Goals" />
        </div>
        <button
          onClick={scrollToApp}
          className="mt-8 text-white/40 transition hover:text-white"
          aria-label="Scroll to app"
        >
          <ChevronDown className="mx-auto h-8 w-8 animate-bounce" />
        </button>
      </header>

      {/* App */}
      <main id="goals-app" className="mx-auto max-w-4xl scroll-mt-8 px-4 pb-12">
        <GoalsApp />
      </main>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 pb-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Milestone className="h-6 w-6 text-orange-300" />,
              title: 'Milestones',
              text: 'Break any goal into bite-sized milestones you can actually check off.',
            },
            {
              icon: <TrendingUp className="h-6 w-6 text-orange-300" />,
              title: 'Progress tracking',
              text: 'Watch your progress bar climb and deadlines stay in view.',
            },
            {
              icon: <PartyPopper className="h-6 w-6 text-orange-300" />,
              title: 'Celebrate wins',
              text: 'Every completed goal gets a trophy moment — you earned it.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15">
                {f.icon}
              </div>
              <h3 className="mb-1 font-bold">{f.title}</h3>
              <p className="text-sm text-white/60">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 pb-10 pt-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <MusicSection accent="orange" />
          <ShareButtons title="Se Fire Goals" text="Set goals, crush milestones, celebrate wins with Se Fire Goals!" />
          <p className="text-center text-sm text-white/50">
            <Link to="/disclaimer" className="underline hover:text-white">
              Disclaimer
            </Link>
            {' · '}© Se Fire Tech
          </p>
        </div>
      </footer>
    </div>
  )
}
