import React from "react";
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const tooltipStyle = {
  backgroundColor: "#0d0d0f",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 12,
};

const LINE_COLORS = [
  "#22d3ee", "#a78bfa", "#f472b6", "#fbbf24",
  "#34d399", "#60a5fa", "#f87171", "#c084fc",
];

export default function ProgressTrendChart({ weekly, trends }) {
  const { t } = useLanguage();

  const data = React.useMemo(() => {
    const map = new Map();
    (weekly || []).forEach((w) => map.set(w.week, { week: w.week.slice(5), avg: w.avgProgress }));
    (trends || []).slice(0, 8).forEach((p) =>
      p.points.forEach((pt) => {
        const row = map.get(pt.week) || { week: pt.week.slice(5) };
        row[p.name] = pt.progress;
        map.set(pt.week, row);
      })
    );
    return Array.from(map.values()).sort((a, b) => (a.week < b.week ? -1 : 1));
  }, [weekly, trends]);

  return (
    <section className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6">
      <h2 className="text-base font-medium text-white">{t("gd.chartProgress")}</h2>
      <p className="mt-1 text-xs text-white/45">{t("gd.chartProgressSub")}</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(255,255,255,0.7)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="avg" name={t("gd.legendAvg")} stroke="#ffffff" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            {(trends || []).slice(0, 8).map((p, i) => (
              <Line
                key={p.name}
                type="monotone"
                dataKey={p.name}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}