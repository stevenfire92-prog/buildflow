import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { actionConfig, timeAgo } from "@/lib/activityDisplay";

const statusPillStyles = {
  draft: "bg-white/10 text-white/80 border-white/20",
  building: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ready: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export default function ActivityFeedItem({ activity, t }) {
  const cfg = actionConfig[activity.action] || actionConfig.updated;
  const Icon = cfg.icon;

  // Extract status pill if status_changed
  const statusMatch =
    activity.action === "status_changed" && activity.details
      ? activity.details.match(/moved to ([a-zA-Z_-]+)/i)
      : null;
  const statusName = statusMatch ? statusMatch[1].toLowerCase() : null;

  const formattedDate = activity.created_date
    ? new Date(activity.created_date).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <li className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.cls}`}>
        <Icon className="w-4 h-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm">
            {activity.actor_name || "Team Member"}
          </span>

          <span className="text-white/45 text-xs">
            {t(cfg.labelKey) || activity.action}
          </span>

          {activity.project_id ? (
            <Link
              to={`/project-details?id=${activity.project_id}`}
              className="inline-flex items-center gap-1 font-medium text-white hover:text-white/80 underline decoration-white/25 hover:decoration-white text-sm"
            >
              <span>{activity.project_name}</span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </Link>
          ) : (
            <span className="font-medium text-white text-sm">{activity.project_name}</span>
          )}

          {statusName && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                statusPillStyles[statusName] || "bg-white/10 text-white/70 border-white/20"
              }`}
            >
              {statusName}
            </span>
          )}
        </div>

        {activity.details && !statusName && (
          <p className="text-xs text-white/60 mt-1 break-words">
            {activity.details}
          </p>
        )}
      </div>

      <span
        title={formattedDate}
        className="text-[11px] text-white/40 shrink-0 whitespace-nowrap mt-1"
      >
        {timeAgo(activity.created_date, t)}
      </span>
    </li>
  );
}