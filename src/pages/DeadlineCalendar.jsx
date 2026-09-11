import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, RefreshCw, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import MonthGrid from "@/components/calendar/MonthGrid";
import { daysUntil, urgencyClasses } from "@/lib/deadlines";
import AppFooter from "@/components/AppFooter";

export default function DeadlineCalendar() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [projects, setProjects] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleSyncCalendar = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncProjectDeadlinesToCalendar", { syncAll: true });
      const count = res.data?.syncedCount ?? 0;
      const fresh = await base44.entities.Project.list("-updated_date", 100);
      setProjects(fresh);
      toast({
        title: t("cal.syncedTitle"),
        description: t("cal.syncedDesc").replace("{n}", count),
      });
    } catch {
      toast({
        title: t("cal.syncFailTitle"),
        description: t("cal.syncFailDesc"),
      });
    } finally {
      setSyncing(false);
    }
  };
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  useEffect(() => {
    base44.entities.Project.list("-updated_date", 100)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  const withDeadlines = useMemo(
    () => (projects || []).filter((p) => p.deadline),
    [projects]
  );

  const deadlineMap = useMemo(() => {
    const map = {};
    withDeadlines.forEach((p) => {
      const k = String(p.deadline).slice(0, 10);
      (map[k] = map[k] || []).push(p);
    });
    return map;
  }, [withDeadlines]);

  const upcoming = useMemo(
    () =>
      withDeadlines
        .map((p) => ({ ...p, days: daysUntil(p.deadline) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 8),
    [withDeadlines]
  );

  const move = (delta) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  const goToday = () => {
    const n = new Date();
    setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
  };

  const monthTitle = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xs">S</span>
              </div>
              <span className="font-semibold tracking-tight">Se Fire Tech</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("cal.gcalActive")}</span>
            </div>
            <button
              onClick={handleSyncCalendar}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? t("cal.syncing") : t("cal.syncGCal")}
            </button>
          </div>
        </div>

        <div className="mt-10 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="flex items-center gap-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              <CalendarDays className="w-7 h-7 text-white/60" /> {t("cal.title")}
            </h1>
            <p className="mt-2 text-white/50">{t("cal.subtitle")}</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => move(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium text-white min-w-[120px] text-center">
              {monthTitle}
            </span>
            <button
              onClick={() => move(1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm rounded-full bg-white text-black font-medium"
            >
              {t("cal.today")}
            </button>
          </div>
        </div>

        {projects === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MonthGrid month={cursor} deadlineMap={deadlineMap} />

            <div className="mt-6">
              <h2 className="text-base font-medium text-white mb-3">
                {t("cal.upcoming")}
              </h2>
              {upcoming.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-sm text-white/40">
                  {t("cal.empty")}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {upcoming.map((p) => (
                    <Link
                      key={p.id}
                      to={`/project-details?id=${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 hover:border-white/25 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-white/40">
                            {new Date(
                              `${String(p.deadline).slice(0, 10)}T00:00:00`
                            ).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {p.google_calendar_event_id && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/80">
                              <CheckCircle2 className="w-3 h-3" /> GCal
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${urgencyClasses(
                          p.deadline
                        )}`}
                      >
                        {p.days < 0
                          ? t("cal.overdue")
                          : p.days === 0
                          ? t("cal.dueToday")
                          : p.days === 1
                          ? t("cal.dueTomorrow")
                          : t("cal.dueIn").replace("{n}", p.days)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <AppFooter />
          </>
        )}
      </div>
    </div>
  );
}