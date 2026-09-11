import React from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const tooltipStyle = {
  backgroundColor: "#0d0d0f",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 12,
};

export default function StatusTrendChart({ weekly }) {
  const { t } = useLanguage();
  const data = weekly.map((w) => ({
    week: w.week.slice(5),
    building: w.building,
    ready: w.ready,
    published: w.published,
  }));

  return (
    <section className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6">
      <h2 className="text-base font-medium text-white">{t("gd.chartStatus")}</h2>
      <p className="mt-1 text-xs text-white/45">{t("gd.chartStatusSub")}</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(255,255,255,0.7)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="building" stackId="1" name={t("gd.legendBuilding")} stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
            <Area type="monotone" dataKey="ready" stackId="1" name={t("gd.legendReady")} stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
            <Area type="monotone" dataKey="published" stackId="1" name={t("gd.legendPublished")} stroke="#34d399" fill="#34d399" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}