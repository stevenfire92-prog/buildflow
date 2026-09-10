import React, { useEffect, useState } from "react";
import { Plus, Pencil, ArrowRightLeft, Trash2, History, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

const csvEscape = (value) => {
  const str = value == null ? "" : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const actionConfig = {
  created: { icon: Plus, cls: "text-emerald-400 bg-emerald-500/15", label: "created" },
  updated: { icon: Pencil, cls: "text-sky-400 bg-sky-500/15", label: "updated settings on" },
  status_changed: { icon: ArrowRightLeft, cls: "text-amber-400 bg-amber-500/15", label: "changed the status of" },
  deleted: { icon: Trash2, cls: "text-red-400 bg-red-500/15", label: "deleted" },
};

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
};

export default function ActivityLog() {
  const [activities, setActivities] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    base44.entities.ActivityLog
      .list("-created_date", 15)
      .then(setActivities)
      .catch(() => setActivities([]));
  }, []);

  const handleDownloadCsv = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const records = await base44.entities.ActivityLog.list("-created_date", 1000);
      const header = ["Date", "Action", "Project", "Details", "Team member", "Email"];
      const rows = (records || []).map((a) => [
        a.created_date,
        a.action,
        a.project_name,
        a.details,
        a.actor_name,
        a.actor_email,
      ]);
      const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sefiretech-activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // export failed — button simply returns to normal state
    }
    setExporting(false);
  };

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white/60" />
          <h2 className="text-sm font-medium text-white">Recent activity</h2>
        </div>
        <button
          onClick={handleDownloadCsv}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {activities === null ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-4 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/40">
          No activity yet — actions by you and your teammates will show up here.
        </p>
      ) : (
        <ul className="space-y-1">
          {activities.map((a) => {
            const cfg = actionConfig[a.action] || actionConfig.updated;
            const Icon = cfg.icon;
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.03]"
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.cls}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80 truncate">
                    <span className="font-medium text-white">{a.actor_name}</span>{" "}
                    {cfg.label}{" "}
                    <span className="font-medium text-white">{a.project_name}</span>
                    {a.details ? <span className="text-white/50"> — {a.details}</span> : null}
                  </p>
                </div>
                <span className="text-xs text-white/40 shrink-0">{timeAgo(a.created_date)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}