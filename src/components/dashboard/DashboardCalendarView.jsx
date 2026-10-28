import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { daysUntil, urgencyClasses } from "@/lib/deadlines";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const statusStyles = {
  draft: "bg-white/10 text-white/70 border-white/20",
  building: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ready: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function DashboardCalendarView({ projects, onProjectUpdate }) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const moveMonth = (delta) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const goToday = () => {
    const n = new Date();
    setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelectedDate(null);
  };

  const handleSyncGCal = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncProjectDeadlinesToCalendar", { syncAll: true });
      const count = res.data?.syncedCount ?? 0;
      toast({
        title: "Calendar Synced",
        description: `Successfully synchronized ${count} project deadline(s) with Google Calendar.`,
      });
    } catch {
      toast({
        title: "Sync Failed",
        description: "Could not sync deadlines to Google Calendar.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Projects that have deadlines
  const projectsWithDeadlines = useMemo(() => {
    return (projects || []).filter((p) => p.deadline);
  }, [projects]);

  // Filtered by selected status tab
  const filteredProjects = useMemo(() => {
    if (selectedStatus === "all") return projectsWithDeadlines;
    return projectsWithDeadlines.filter((p) => p.status === selectedStatus);
  }, [projectsWithDeadlines, selectedStatus]);

  // Map dates to project arrays
  const deadlineMap = useMemo(() => {
    const map = {};
    filteredProjects.forEach((p) => {
      const k = String(p.deadline).slice(0, 10);
      (map[k] = map[k] || []).push(p);
    });
    return map;
  }, [filteredProjects]);

  // Urgent / Upcoming projects sorted by due date
  const upcomingProjects = useMemo(() => {
    return projectsWithDeadlines
      .map((p) => ({ ...p, days: daysUntil(p.deadline) }))
      .sort((a, b) => a.days - b.days);
  }, [projectsWithDeadlines]);

  // Calendar cells generation
  const monthData = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const startWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const today = new Date();
  const isToday = (d) =>
    d &&
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const toKey = (d) =>
    d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`
      : "";

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthTitle = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Projects for active selected date
  const selectedDateProjects = selectedDate ? deadlineMap[selectedDate] || [] : null;

  return (
    <div className="space-y-6">
      {/* Calendar Controls & Overview Bar */}
      <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Project Deadlines Calendar
              </h2>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Live timeline tracking {projectsWithDeadlines.length} scheduled milestone deadlines pulled directly from your project data.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncGCal}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white/80 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync Google Calendar"}</span>
            </button>

            {/* Month Navigator */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="Previous month"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs sm:text-sm font-medium text-white min-w-[110px] text-center">
                {monthTitle}
              </span>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="Next month"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="px-2.5 py-1 text-xs rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["all", "building", "ready", "draft", "published"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setSelectedDate(null);
                }}
                className={`px-3 py-1 text-xs rounded-full capitalize whitespace-nowrap transition-colors ${
                  selectedStatus === st
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-xs text-white/40">
            Showing <span className="text-white font-medium">{filteredProjects.length}</span> deadline(s)
          </div>
        </div>

        {/* Selected Date Filter Banner */}
        {selectedDate && (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Viewing deadlines for <strong className="text-white">{selectedDate}</strong> ({selectedDateProjects?.length || 0} project{selectedDateProjects?.length === 1 ? "" : "s"})
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-amber-400 hover:text-amber-200 underline font-medium"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* The Monthly Calendar Grid */}
        <div className="mt-4 rounded-xl bg-black/40 border border-white/10 p-2 sm:p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1.5 min-w-[620px]">
            {weekdays.map((w) => (
              <div key={w} className="text-center text-xs font-semibold text-white/40 pb-2">
                {w}
              </div>
            ))}

            {monthData.map((d, idx) => {
              const k = toKey(d);
              const items = d ? deadlineMap[k] || [] : [];
              const hasItems = items.length > 0;
              const isSelected = selectedDate === k;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (d && hasItems) {
                      setSelectedDate(selectedDate === k ? null : k);
                    }
                  }}
                  className={`min-h-[96px] rounded-xl border p-2 transition-all flex flex-col justify-between ${
                    !d
                      ? "border-transparent bg-transparent"
                      : isSelected
                      ? "border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30 shadow-md"
                      : hasItems
                      ? "border-white/20 bg-white/[0.04] hover:border-amber-400/50 cursor-pointer"
                      : "border-white/5 bg-white/[0.015]"
                  } ${d && isToday(d) ? "ring-1 ring-white/40" : ""}`}
                >
                  {d && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${
                            isToday(d)
                              ? "font-bold text-black bg-white w-5 h-5 rounded-full flex items-center justify-center"
                              : hasItems
                              ? "font-semibold text-white"
                              : "text-white/40"
                          }`}
                        >
                          {d.getDate()}
                        </span>
                        {hasItems && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>

                      <div className="space-y-1 my-1">
                        {items.slice(0, 2).map((p) => (
                          <Link
                            key={p.id}
                            to={`/project-details?id=${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`block truncate text-[10px] px-1.5 py-0.5 rounded font-medium border hover:scale-[1.02] transition-transform ${
                              statusStyles[p.status] || "bg-white/10 text-white"
                            }`}
                            title={`${p.name} (${p.status}) - ${p.progress || 0}%`}
                          >
                            {p.name}
                          </Link>
                        ))}
                        {items.length > 2 && (
                          <div className="text-[10px] font-medium text-amber-300/80 px-1">
                            +{items.length - 2} more
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] text-white/30 text-right">
                        {hasItems ? `${items.length} due` : ""}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines List & Urgency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left: Detailed Upcoming Deadlines */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Upcoming Project Deadlines</span>
            </h3>
            <span className="text-xs text-white/40">
              Sorted by urgency
            </span>
          </div>

          {upcomingProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-xs text-white/40">
              No project deadlines scheduled yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingProjects.map((p) => {
                const days = p.days;
                const formattedDate = new Date(`${String(p.deadline).slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Link
                    key={p.id}
                    to={`/project-details?id=${p.id}`}
                    className="group rounded-xl bg-white/[0.03] border border-white/10 p-3.5 hover:border-white/30 hover:bg-white/[0.06] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${statusStyles[p.status] || "bg-white/10 text-white"}`}>
                          {p.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${urgencyClasses(
                            p.deadline
                          )}`}
                        >
                          {days < 0
                            ? "Overdue"
                            : days === 0
                            ? "Due Today"
                            : days === 1
                            ? "Due Tomorrow"
                            : `Due in ${days} days`}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
                        {p.description || "No description set"}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="text-white/50 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3 text-white/40" />
                        <span>{formattedDate}</span>
                      </div>
                      <span className="text-white/40 group-hover:text-white transition-colors flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Deadline Metrics Summary */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Timeline Stats</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Total Scheduled</span>
              <span className="text-lg font-bold text-white">
                {projectsWithDeadlines.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <span className="text-xs text-amber-300">Due Within 14 Days</span>
              <span className="text-lg font-bold text-amber-300">
                {upcomingProjects.filter((p) => p.days >= 0 && p.days <= 14).length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-emerald-300">Completed / Published</span>
              <span className="text-lg font-bold text-emerald-300">
                {projectsWithDeadlines.filter((p) => p.status === "published").length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Active In Build</span>
              <span className="text-lg font-bold text-sky-300">
                {projectsWithDeadlines.filter((p) => p.status === "building").length}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link
              to="/calendar"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              <span>Open Dedicated Calendar Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}