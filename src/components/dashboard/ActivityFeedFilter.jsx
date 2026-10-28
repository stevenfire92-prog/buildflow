import React from "react";
import { Search, Download, RotateCw } from "lucide-react";

export default function ActivityFeedFilter({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  isLive,
  onRefresh,
  refreshing,
  onExport,
  exporting,
  t,
  counts,
}) {
  const tabs = [
    { id: "all", label: t("act.filterAll") || "All Activity", count: counts.all },
    { id: "status_changed", label: t("act.filterStatus") || "Status Changes", count: counts.status },
    { id: "updated", label: t("act.filterUpdates") || "Updates & Progress", count: counts.updates },
    { id: "created", label: t("act.filterCreated") || "New Builds", count: counts.created },
    { id: "commented", label: t("act.filterComments") || "Comments", count: counts.comments },
  ];

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("act.searchPlaceholder") || "Filter activity history..."}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Action buttons & Live pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t("act.liveBadge") || "LIVE FEED"}</span>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-full text-white/60 hover:text-white bg-white/5 border border-white/10 hover:border-white/25 transition-colors disabled:opacity-50"
            title="Refresh feed"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? t("act.exporting") : t("act.exportCsv")}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                active
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? "bg-black/15 text-black font-bold" : "bg-white/10 text-white/70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}