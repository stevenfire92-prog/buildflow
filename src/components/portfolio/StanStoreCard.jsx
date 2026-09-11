import React, { useState } from "react";
import { Store, ExternalLink, Copy, Check, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STAN_STORE_URL = "https://stan.store/DeezNutz";

export default function StanStoreCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STAN_STORE_URL);
      setCopied(true);
      toast({
        title: "Stan Store link copied!",
        description: STAN_STORE_URL,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Could not copy link" });
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/[0.08] via-purple-500/[0.05] to-transparent p-6 sm:p-7 relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Store className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Stan Store Official
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Launching Soon
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              stan.store/DeezNutz
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              The official digital products and creator storefront for Steven Thomas Turcott (Se Fire Tech). Digital downloads, exclusive development templates, and creator resources.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <a
            href={STAN_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-md hover:scale-[1.02]"
          >
            <span>Visit Storefront</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feature teaser pills */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs text-white/50">
        <span className="font-medium text-white/70">Coming soon to store:</span>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Project Blueprints</span>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Creator Presets</span>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Digital Guides</span>
        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Audio Samples</span>
      </div>
    </div>
  );
}