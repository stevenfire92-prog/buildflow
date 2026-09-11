import React from "react";
import {
  ResponsiveContainer, ComposedChart, Area, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const tooltipStyle = {
  backgroundColor: "#0d0d0f",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontSize: 12,
};

export default function PortfolioGrowthChart({ weekly }) {
  const { t } = useLanguage();
  const data = weekly.map((w) => ({
    week: w.week.slice(5),
    total: w.total,
    newProjects: w.newProjects,
  }));

  return (
    <section className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6">
      <h2 className="text-base font-medium text-white">{t("gd.chartPortfolio")}</h2>
      <p className="mt-1 text-xs text-white/45">{t("gd.chartPortfolioSub")}</p>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gdTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgba(255,255,255,0.7)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="total" name={t("gd.totalProjects")} stroke="#ffffff" strokeWidth={2} fill="url(#gdTotal)" />
            <Bar dataKey="newProjects" name={t("gd.newProjects")} fill="#a78bfa" radius={[3, 3, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}