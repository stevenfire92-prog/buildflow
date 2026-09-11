import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import MonthGrid from "@/components/calendar/MonthGrid";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardCalendar({ projects, onSwitchToCalendarView }) {
  const { t } = useLanguage();

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

  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <section className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-base font-medium text-white">
            <CalendarDays className="w-4 h-4 text-amber-400" /> {t("dc.title")}
          </h2>
          {withDeadlines.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
              {withDeadlines.length} scheduled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSwitchToCalendarView && (
            <button
              onClick={onSwitchToCalendarView}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
            >
              Full Calendar View
            </button>
          )}
          <Link
            to="/calendar"
            className="text-xs font-medium text-white/60 hover:text-white underline-offset-4 hover:underline"
          >
            {t("dc.viewAll")}
          </Link>
        </div>
      </div>

      {withDeadlines.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 py-10 text-center text-sm text-white/40">
          {t("cal.empty")}
        </p>
      ) : (
        <div className="mt-4">
          <MonthGrid month={month} deadlineMap={deadlineMap} />
        </div>
      )}
    </section>
  );
}