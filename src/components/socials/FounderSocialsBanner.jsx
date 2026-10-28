import React from "react";
import { Music, BookOpen, Store, ShieldCheck, ExternalLink, Sparkles, Disc3, ArrowUpRight } from "lucide-react";

export default function FounderSocialsBanner({ className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black p-6 sm:p-7 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Creator Ecosystem
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Stripe Secure Checkout
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Steven Thomas Turcott · Official Hub & Profiles
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-2xl">
              Founder of Se Fire Tech. Every web app, dark fantasy book in the Shadow Path series, and original music track is synchronized into this unified platform.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://stan.store/DeezNutz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-md hover:scale-[1.02]"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Official Stan Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Multi-channel Connected Hub Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Music Streaming Catalog */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-xs mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <span>Original Music</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Steven Thomas Turcott</p>
            <p className="text-xs text-white/50 mb-3">Synthwave, deep focus & workout motivation tracks.</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href="https://open.spotify.com/search/Steven%20Thomas%20Turcott"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#1DB954] hover:underline flex items-center gap-1"
              >
                Spotify <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://music.apple.com/search?term=Steven%20Thomas%20Turcott"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-rose-400 hover:underline flex items-center gap-1"
              >
                Apple Music <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://soundcloud.com/search?q=Steven%20Turcott"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                SoundCloud
              </a>
            </div>
          </div>

          {/* Card 2: 9-Book Amazon Kindle Epic */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-xs mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Kindle Bestsellers</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Shadow Path (9 Books)</p>
            <p className="text-xs text-white/50 mb-3">Epic dark fantasy novel series available on Amazon Kindle & Paperback.</p>
            <a
              href="https://www.amazon.com/dp/B0H132QN3M"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-amber-300 hover:underline inline-flex items-center gap-1"
            >
              Browse Series on Amazon <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Card 3: Stan Store Digital Assets */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2.5 text-purple-400 font-semibold text-xs mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <span>Digital Storefront</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">stan.store/DeezNutz</p>
            <p className="text-xs text-white/50 mb-3">Exclusive project blueprints, templates, and creator presets.</p>
            <a
              href="https://stan.store/DeezNutz"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-purple-300 hover:underline inline-flex items-center gap-1"
            >
              Visit Stan Store <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Card 4: Stripe Live Monetization */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs mb-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Live Monetization</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Automated Stripe Engine</p>
            <p className="text-xs text-white/50 mb-3">Checkout and subscriptions are available when payment setup is complete.</p>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <Disc3 className="w-3 h-3 animate-spin text-emerald-400" /> Payment setup required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}