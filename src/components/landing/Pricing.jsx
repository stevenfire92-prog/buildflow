import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Pricing() {
  const { t } = useLanguage();

  const freeFeatures = [
    t("pricing.freeF1"),
    t("pricing.freeF2"),
    t("pricing.freeF3"),
    t("pricing.freeF4"),
  ];

  const paidFeatures = [
    t("pricing.paidF1"),
    t("pricing.paidF2"),
    t("pricing.paidF3"),
    t("pricing.paidF4"),
  ];

  return (
    <section id="pricing" className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            {t("pricing.title")}
          </h2>
          <p className="mt-5 text-lg text-white/60">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-lg font-medium text-white">{t("pricing.freeTitle")}</h3>
              <div className="text-right">
                <span className="text-3xl font-semibold text-white">$0</span>
                <span className="text-sm text-white/40">/mo</span>
              </div>
            </div>
            <a
              href="#start"
              className="mt-5 block text-center py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
            >
              {t("nav.startBuilding")}
            </a>
            <p className="mt-5 text-xs text-white/40 mb-4">{t("pricing.getAccess")}</p>
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/30 p-8 relative">
            <div className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
              {t("pricing.popular")}
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-lg font-medium text-white">{t("pricing.paidTitle")}</h3>
              <div className="text-right">
                <span className="text-3xl font-semibold text-white">$16</span>
                <span className="text-sm text-white/40">/mo</span>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">{t("pricing.billedAnnually")}</p>
            <a
              href="#pricing"
              className="mt-5 block text-center py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
            >
              {t("pricing.seeAllPlans")}
            </a>
            <p className="mt-5 text-xs text-white/40 mb-4">
              {t("pricing.upgradeNote")}
            </p>
            <ul className="space-y-3">
              {paidFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-violet-300" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-white/40 mt-8">
          {t("pricing.enterpriseQ")}{" "}
          <a href="#sales" className="text-white/70 hover:text-white underline underline-offset-2">
            {t("pricing.contactSales")}
          </a>
        </p>
      </div>
    </section>
  );
}