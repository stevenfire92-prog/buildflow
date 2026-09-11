import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const usd = (cents) =>
  (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function RevenueSummary() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke("getRevenueSummary", {})
      .then((res) => setData(res.data))
      .catch(() => setFailed(true));
  }, []);

  const chartData = (data?.months || []).map((m) => ({
    label: m.label,
    dollars: m.cents / 100,
    new_subs: m.new_subs,
    total_subs: m.total_subs,
  }));

  const tooltipStyle = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-white">{t("rev.earnings")}</h3>
            <p className="text-[11px] text-white/35 mt-0.5">{t("rev.earningsSub")}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold text-white">
              {data ? usd(data.total_cents_last_6) : "—"}
            </span>
            <p className="text-[10px] text-white/35 mt-0.5">{t("rev.last6")}</p>
          </div>
        </div>
        <div className="h-48 -ml-2 overflow-hidden">
          {failed ? (
            <div className="h-full flex items-center justify-center text-sm text-white/35">
              {t("rev.loadError")}
            </div>
          ) : !data ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
            </div>
          ) : data.months.every((m) => m.payments === 0) ? (
            <div className="h-full flex items-center justify-center text-sm text-white/35">
              {t("rev.noPayments")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.15)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, t("rev.earnings")]}
                />
                <Area
                  type="monotone"
                  dataKey="dollars"
                  stroke="rgb(52,211,153)"
                  strokeWidth={2}
                  fill="url(#revEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-white">{t("rev.subGrowth")}</h3>
            <p className="text-[11px] text-white/35 mt-0.5">{t("rev.subGrowthSub")}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold text-white">
              {data ? data.active_subscriptions : "—"}
            </span>
            <p className="text-[10px] text-white/35 mt-0.5">{t("rev.activeSubs")}</p>
          </div>
        </div>
        <div className="h-48 -ml-2 overflow-hidden">
          {failed ? (
            <div className="h-full flex items-center justify-center text-sm text-white/35">
              {t("rev.loadError")}
            </div>
          ) : !data ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
            </div>
          ) : data.months.every((m) => m.new_subs === 0) ? (
            <div className="h-full flex items-center justify-center text-sm text-white/35">
              {t("rev.noSubs")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="new_subs"
                  name={t("rev.newSubs")}
                  fill="rgba(255,255,255,0.7)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  type="monotone"
                  dataKey="total_subs"
                  name={t("rev.totalSubs")}
                  stroke="rgb(56,189,248)"
                  strokeWidth={2}
                  dot={{ fill: "rgb(56,189,248)", r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}