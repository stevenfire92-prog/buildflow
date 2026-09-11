import React, { useMemo } from "react";
import { urgencyClasses } from "@/lib/deadlines";

export default function MonthGrid({ month, deadlineMap }) {
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    // Jan 1, 2023 was a Sunday
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  }, []);

  const cells = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const startWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(y, m, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [month]);

  const today = new Date();
  const isToday = (d) =>
    d &&
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const key = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 sm:p-4 overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 min-w-[560px]">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-xs text-white/40 pb-1">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const items = d ? deadlineMap[key(d)] || [] : [];
          return (
            <div
              key={i}
              className={`min-h-[88px] rounded-lg border p-1.5 ${
                d ? "border-white/10 bg-white/[0.02]" : "border-transparent"
              } ${d && isToday(d) ? "ring-1 ring-white/30" : ""}`}
            >
              {d && (
                <>
                  <div
                    className={`text-xs ${
                      isToday(d) ? "font-bold text-white" : "text-white/50"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                  {items.slice(0, 2).map((p) => (
                    <div
                      key={p.id}
                      className={`mt-1 truncate text-[10px] px-1.5 py-0.5 rounded border ${urgencyClasses(
                        p.deadline
                      )}`}
                    >
                      {p.name}
                    </div>
                  ))}
                  {items.length > 2 && (
                    <div className="mt-1 text-[10px] text-white/40">
                      +{items.length - 2}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}