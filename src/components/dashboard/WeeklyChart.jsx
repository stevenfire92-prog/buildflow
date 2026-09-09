import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function getWeekStart(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyChart({ projects }) {
  const data = useMemo(() => {
    const weekMap = new Map();
    for (const p of projects) {
      const start = getWeekStart(p.created_date);
      const key = start.getTime();
      weekMap.set(key, (weekMap.get(key) || 0) + 1);
    }
    const weeks = [...weekMap.entries()].sort((a, b) => a[0] - b[0]);
    return weeks.map(([ts, count]) => ({
      week: new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    }));
  }, [projects]);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-white">New projects per week</h3>
          <p className="text-[11px] text-white/35 mt-0.5">
            How many projects were created each week
          </p>
        </div>
        <span className="text-2xl font-semibold text-white">
          {projects.length}
        </span>
      </div>
      <div className="h-48 -ml-2 overflow-hidden">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="week"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" name="New projects" fill="rgba(255,255,255,0.7)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-white/35">
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}