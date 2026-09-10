import React, { useState } from "react";
import { Send, Mic, Plus, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const cards = [
  { label: "Distance", cls: "col-span-2 row-span-1", tone: "from-emerald-500/20 to-emerald-500/5" },
  { label: "Reps", cls: "col-span-2 row-span-2", tone: "from-orange-500/20 to-orange-500/5" },
  { label: "88", cls: "col-span-1 row-span-1", tone: "from-lime-500/20 to-lime-500/5" },
  { label: "Footprint", cls: "col-span-2 row-span-2", tone: "from-sky-500/20 to-sky-500/5" },
  { label: "Funding", cls: "col-span-1 row-span-2", tone: "from-violet-500/20 to-violet-500/5" },
  { label: "Altitude", cls: "col-span-2 row-span-1", tone: "from-rose-500/20 to-rose-500/5" },
];

export default function Hero() {
  const { t } = useLanguage();
  const [active, setActive] = useState("apps");
  const [value, setValue] = useState("");

  const tabs = [
    { key: "apps", label: t("hero.apps"), ph: "hero.placeholderApp" },
    { key: "websites", label: t("hero.websites"), ph: "hero.placeholderWebsite" },
    { key: "games", label: t("hero.games"), ph: "hero.placeholderGame" },
    { key: "tools", label: t("hero.tools"), ph: "hero.placeholderTool" },
  ];
  const activeTab = tabs.find((x) => x.key === active) || tabs[0];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-violet-600/30 via-blue-600/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-7">
            <Sparkles className="w-3.5 h-3.5" />
            {t("hero.badge")}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Chat prompt */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-2 shadow-2xl">
            <div className="flex items-center gap-2 px-2 pt-1.5 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    active === tab.key
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 px-3 pb-1">
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={1}
                placeholder={t(activeTab.ph)}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 resize-none outline-none py-2.5 min-h-[44px]"
              />
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-white/30 mt-3">
            {t("hero.freeStart")}
          </p>
        </div>

        {/* Floating cards grid */}
        <div className="mt-16 grid grid-cols-6 grid-rows-3 gap-3 h-64 max-w-4xl mx-auto">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`rounded-xl bg-gradient-to-br ${c.tone} border border-white/10 backdrop-blur-sm p-4 flex flex-col justify-between ${c.cls}`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-2/3 rounded-full bg-white/20" />
                <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-white/50 font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}