import React, { useState, useEffect } from "react";
import { RefreshCw, Sheet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppHeader from "@/components/AppHeader";
import GrowthStatsCards from "@/components/growth/GrowthStatsCards";
import PortfolioGrowthChart from "@/components/growth/PortfolioGrowthChart";
import StatusTrendChart from "@/components/growth/StatusTrendChart";
import ProgressTrendChart from "@/components/growth/ProgressTrendChart";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrowthDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke("getSheetGrowthDashboard", {})
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke("getSheetGrowthDashboard", {});
      setData(res.data);
      setError(false);
    } catch {
      setError(true);
    }
    setRefreshing(false);
  };

  const weekly = (data && data.weekly) || [];
  const trends = (data && data.projectTrends) || [];

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6">
        <AppHeader backTo="/dashboard" />

        <div className="mt-10 mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
              <Sheet className="w-6 h-6 text-white/60" /> {t("gd.title")}
            </h1>
            <p className="mt-2 text-white/50">{t("gd.subtitle")}</p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing || !data && !error}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 border border-white/10 hover:text-white hover:border-white/25 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {t("gd.refresh")}
          </button>
        </div>

        {data === null && !error ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-white/60 font-medium">{t("gd.errorTitle")}</p>
            <p className="mt-1 text-sm text-white/35">{t("gd.errorDesc")}</p>
            <button
              onClick={refresh}
              className="mt-6 px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              {t("gd.refresh")}
            </button>
          </div>
        ) : weekly.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-white/60 font-medium">{t("gd.emptyTitle")}</p>
            <p className="mt-1 text-sm text-white/35">{t("gd.emptySub")}</p>
          </div>
        ) : (
          <>
            <GrowthStatsCards weekly={weekly} />
            <div className="mt-4">
              <PortfolioGrowthChart weekly={weekly} />
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StatusTrendChart weekly={weekly} />
              <ProgressTrendChart weekly={weekly} trends={trends} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}