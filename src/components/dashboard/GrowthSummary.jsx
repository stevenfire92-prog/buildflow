import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { actionConfig, timeAgo } from "@/lib/activityDisplay";

const DAY = 86400000;

export default function GrowthSummary({ projects = [] }) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState(null);

  useEffect(() => {
    base44.entities.ActivityLog
      .list("-created_date", 3)
      .then(setActivities)
      .catch(() => setActivities([]));
  }, []);

  const total = projects.length;
  const avgProgress = total
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total)
    : 0;
  const inProgress = projects.filter(
    (p) => p.status === "building" || p.status === "ready"
  ).length;
  const published = projects.filter((p) => p.status === "published").length;

  const weekAgo = Date.now() - 7 * DAY;
  const twoWeeksAgo = weekAgo - 7 * DAY;
  const thisWeek = projects.filter(
    (p) => new Date(p.created_date).getTime() >= weekAgo
  ).length;
  const lastWeek = projects.filter((p) => {
    const ts = new Date(p.created_date).getTime();
    return ts >= twoWeeksAgo && ts < weekAgo;
  }).length;

  const TrendIcon =
    thisWeek > lastWeek ? TrendingUp : thisWeek < lastWeek ? TrendingDown : Minus;
  const trendCls =
    thisWeek > lastWeek
      ? "text-emerald-400"
      : thisWeek < lastWeek
        ? "text-red-400"
        : "text-white/40";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-white">{t("gs.overallProgress")}</h3>
            <p className="text-[11px] text-white/35 mt-0.5">{t("gs.portfolio")}</p>
          </div>
          <span className="text-2xl font-semibold text-white">
            {total ? `${avgProgress}%` : "—"}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {inProgress} {t("gs.inProgress")}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {published} {t("gs.published")}
            </span>
          </div>
          {total > 0 && (
            <span className={`flex items-center gap-1.5 text-xs ${trendCls}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {t("gs.weekTrend")
                .replace("{n}", thisWeek)
                .replace("{m}", lastWeek)}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <h3 className="font-medium text-white mb-2">{t("gs.latestActivity")}</h3>
        {activities === null ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">{t("gs.noActivity")}</p>
        ) : (
          <ul className="space-y-1">
            {activities.map((a) => {
              const cfg = actionConfig[a.action] || actionConfig.updated;
              const Icon = cfg.icon;
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.cls}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/80 truncate">
                      <span className="font-medium text-white">{a.actor_name}</span>{" "}
                      {t(cfg.labelKey)}{" "}
                      <span className="font-medium text-white">{a.project_name}</span>
                    </p>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">
                    {timeAgo(a.created_date, t)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}