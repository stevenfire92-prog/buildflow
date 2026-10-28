import React, { useState, useEffect, useMemo, useCallback } from "react";
import { History, Activity, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { csvEscape } from "@/lib/activityDisplay";
import ActivityFeedItem from "./ActivityFeedItem";
import ActivityFeedFilter from "./ActivityFeedFilter";

const INITIAL_LIMIT = 30;

export default function ActivityLog() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState(null);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // Load activities from Base44
  const loadActivities = useCallback((fetchLimit = INITIAL_LIMIT) => {
    return base44.entities.ActivityLog
      .list("-created_date", fetchLimit)
      .then((records) => {
        setActivities(records || []);
        if (!records || records.length < fetchLimit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      })
      .catch(() => {
        setActivities([]);
        setHasMore(false);
      });
  }, []);

  // Initial fetch and Real-time subscription
  useEffect(() => {
    loadActivities(limit);

    // Subscribe to live activity stream
    const unsubscribe = base44.entities.ActivityLog.subscribe((event) => {
      if (event?.type === "create" && event?.data) {
        setActivities((prev) => {
          if (!prev) return [event.data];
          // Prevent duplicates if already present
          if (prev.some((item) => item.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event?.type === "delete" && event?.id) {
        setActivities((prev) => (prev ? prev.filter((item) => item.id !== event.id) : prev));
      } else if (event?.type === "update" && event?.data) {
        setActivities((prev) =>
          prev ? prev.map((item) => (item.id === event.data.id ? { ...item, ...event.data } : item)) : prev
        );
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [loadActivities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities(limit);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    const nextLimit = limit + 25;
    setLimit(nextLimit);
    loadActivities(nextLimit);
  };

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
      link.download = `builderflow-activity-feed-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // export error handled silently
    } finally {
      setExporting(false);
    }
  };

  // Category counts
  const counts = useMemo(() => {
    const raw = activities || [];
    return {
      all: raw.length,
      status: raw.filter((a) => a.action === "status_changed").length,
      updates: raw.filter((a) => a.action === "updated").length,
      created: raw.filter((a) => a.action === "created").length,
      comments: raw.filter((a) => a.action === "commented" || a.action === "file_uploaded").length,
    };
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    let list = activities;

    if (activeTab === "status_changed") {
      list = list.filter((a) => a.action === "status_changed");
    } else if (activeTab === "updated") {
      list = list.filter((a) => a.action === "updated");
    } else if (activeTab === "created") {
      list = list.filter((a) => a.action === "created");
    } else if (activeTab === "commented") {
      list = list.filter((a) => a.action === "commented" || a.action === "file_uploaded");
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.project_name || "").toLowerCase().includes(q) ||
          (a.details || "").toLowerCase().includes(q) ||
          (a.actor_name || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [activities, activeTab, searchQuery]);

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {t("act.liveFeed") || "Live Activity Feed"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-white/50 max-w-xl">
            {t("act.feedSubtitle") ||
              "Real-time history of all project updates, status transitions, and build progress across your workspace."}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <ActivityFeedFilter
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLive={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExport={handleDownloadCsv}
        exporting={exporting}
        t={t}
        counts={counts}
      />

      {/* Activity List */}
      <div className="mt-4">
        {activities === null ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 p-6">
            <History className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/60">
              {t("act.empty")}
            </p>
            <p className="text-xs text-white/40 mt-1">
              Updates will automatically stream here when projects are modified.
            </p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-white/10 p-6">
            <p className="text-sm text-white/60">
              {t("act.noMatches") || "No activity matching your filter"}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {t("act.noMatchesSub") || "Try choosing another filter tab or clearing the search query."}
            </p>
          </div>
        ) : (
          <ul className="space-y-1 divide-y divide-white/[0.04]">
            {filteredActivities.map((a) => (
              <ActivityFeedItem key={a.id} activity={a} t={t} />
            ))}
          </ul>
        )}

        {/* Load More Button */}
        {hasMore && activities && activities.length >= limit && (
          <div className="mt-4 text-center pt-2">
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>{t("act.loadMore") || "Load older activity"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}