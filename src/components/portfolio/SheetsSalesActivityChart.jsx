import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Table, RefreshCw, BookOpen, Activity, ExternalLink, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function SheetsSalesActivityChart() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("https://docs.google.com/spreadsheets/d/1QnMJeXMSfKOPARATjAauMF3pKETVnapEGRzVE8jb-io/edit");

  const fetchData = async () => {
    try {
      const res = await base44.functions.invoke("getSheetGrowthDashboard", {});
      const weekly = res.data?.weekly || [];
      setData(weekly);
    } catch (err) {
      console.warn("Failed to load Google Sheet metrics:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setRefreshing(true);
    try {
      const exportRes = await base44.functions.invoke("exportWeeklyMetricsToSheet", {});
      if (exportRes.data?.spreadsheet_url) {
        setSheetUrl(exportRes.data.spreadsheet_url);
      }
      await fetchData();
      toast({
        title: "Google Sheet Synced",
        description: "Latest book sales & recent activity metrics updated from Google Sheets.",
      });
    } catch {
      toast({
        title: "Sync failed",
        description: "Could not export fresh metrics to Google Sheets.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Format chart data
  const chartData = (data || []).map((w) => {
    const d = new Date(w.week);
    const label = !isNaN(d.getTime())
      ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : w.week;
    return {
      week: label,
      bookSales: w.bookSales ?? 0,
      activities: w.activities ?? 0,
      revenue: w.bookRevenue ?? ((w.bookSales ?? 0) * 4.99),
    };
  });

  const totalBookSales = chartData.reduce((sum, d) => sum + d.bookSales, 0);
  const totalActivities = chartData.reduce((sum, d) => sum + d.activities, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-5 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Book Sales & Activity Reports
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Google Sheets Daily Sync
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Automated daily sales data and team activity pulled directly from Google Sheets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
            >
              <span>Open Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={handleSync}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Sheet"}</span>
          </button>
        </div>
      </div>

      {/* Metric summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Total Book Sales</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalBookSales}
            </span>
            <span className="text-xs text-white/40">
              (${totalRevenue.toFixed(2)})
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Across Shadow Path Kindle series
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Recent Activity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalActivities}
            </span>
            <span className="text-xs text-sky-400/80">events</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Logged across projects & updates
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/[0.02] border border-white/5 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <Table className="w-3.5 h-3.5" />
            <span>Sync Cadence</span>
          </div>
          <div className="text-sm font-semibold text-emerald-400 tracking-tight mt-1">
            Daily Auto-Sync
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            9:00 AM EDT · Google Sheets API
          </p>
        </div>
      </div>

      {/* Chart container */}
      <div className="mt-2 h-60 w-full min-h-[240px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-white/40 gap-2">
            <span>No sheet report rows found. Click "Sync Sheet" to populate.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, bottom: 4, left: -10 }}
              barGap={8}
            >
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="week"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: "4px" }}
                formatter={(value, name) => [
                  value,
                  name === "bookSales" ? "Book Sales" : "Recent Activity",
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "11px" }}
                formatter={(val) => (
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>
                    {val === "bookSales" ? "Book Sales (Units)" : "Recent Activity (Events)"}
                  </span>
                )}
              />
              <Bar
                dataKey="bookSales"
                name="bookSales"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Bar
                dataKey="activities"
                name="activities"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}