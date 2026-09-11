import React from "react";
import { Boxes, Plus, Gauge, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrowthStatsCards({ weekly }) {
  const { t } = useLanguage();
  const latest = weekly[weekly.length - 1];
  const prev = weekly[weekly.length - 2];

  const cards = [
    { icon: Boxes, label: t("gd.statTotal"), value: latest.total, prev: prev && prev.total },
    { icon: Plus, label: t("gd.statNew"), value: latest.newProjects, prev: prev && prev.newProjects },
    { icon: Gauge, label: t("gd.statAvgProgress"), value: `${latest.avgProgress}%`, prev: prev && prev.avgProgress },
    { icon: Zap, label: t("gd.statActivities"), value: latest.activities, prev: prev && prev.activities },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const delta =
          typeof c.prev === "number" && typeof c.value === "number"
            ? c.value - c.prev
            : null;
        return (
          <div key={c.label} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <div className="flex items-center gap-2 text-white/45">
              <Icon className="w-4 h-4" />
              <span className="text-xs">{c.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{c.value}</p>
            {delta !== null && (
              <p className={`mt-0.5 text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {delta >= 0 ? "+" : ""}{delta} {t("gd.vsPrev").replace("{n}", c.prev)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}