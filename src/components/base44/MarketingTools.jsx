import React from "react";
import { Search, Share2, LineChart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MarketingTools() {
  const { t } = useLanguage();

  const tools = [
    {
      icon: Search,
      title: t("mk.tool1Title"),
      desc: t("mk.tool1Desc"),
    },
    {
      icon: Share2,
      title: t("mk.tool2Title"),
      desc: t("mk.tool2Desc"),
    },
    {
      icon: LineChart,
      title: t("mk.tool3Title"),
      desc: t("mk.tool3Desc"),
    },
  ];

  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
            {t("mk.title")}
          </h2>
          <p className="mt-5 text-lg text-white/60">
            {t("mk.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-7 hover:border-white/20 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-5">
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{tool.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* Case study strip */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1">
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-light">
              "{t("mk.quote")}"
            </p>
            <p className="mt-4 text-sm text-white/50">
              — Yoav Hornung · Founder, Gift My Book · ex-Fiverr
            </p>
            <a
              href="#case-study"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              {t("mk.readStory")} →
            </a>
          </div>
          <div className="flex gap-6 md:gap-8 shrink-0">
            <div>
              <div className="text-3xl font-semibold text-white">1 week</div>
              <div className="text-xs text-white/40 mt-1">{t("mk.stat1")}</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">$1M</div>
              <div className="text-xs text-white/40 mt-1">{t("mk.stat2")}</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">6-8%</div>
              <div className="text-xs text-white/40 mt-1">{t("mk.stat3")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}