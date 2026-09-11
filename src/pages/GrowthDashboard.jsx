import React, { useState, useEffect } from "react";
import { RefreshCw, Sheet, Mail, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppHeader from "@/components/AppHeader";
import GrowthStatsCards from "@/components/growth/GrowthStatsCards";
import PortfolioGrowthChart from "@/components/growth/PortfolioGrowthChart";
import StatusTrendChart from "@/components/growth/StatusTrendChart";
import ProgressTrendChart from "@/components/growth/ProgressTrendChart";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import AppFooter from "@/components/AppFooter";
import { useToast } from "@/components/ui/use-toast";

export default function GrowthDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

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

  const handleSendWeeklyEmail = async () => {
    setSendingEmail(true);
    try {
      // First ensure Google Sheets has fresh metrics
      await base44.functions.invoke("exportWeeklyMetricsToSheet", {});
      // Now send the email report reading directly from Google Sheets
      const res = await base44.functions.invoke("sendWeeklyGmailReport", {
        run_key: "bf-weekly-gmail-report-7f3c"
      });
      if (res.data?.ok) {
        setEmailSentSuccess(true);
        toast({
          title: "Weekly report sent!",
          description: `Progress and Google Sheets metric report sent to ${res.data.sent?.[0]?.to || "your inbox"}.`,
        });
      } else {
        toast({
          title: "Could not send report",
          description: res.data?.error || "Please check Gmail authorization.",
        });
      }
    } catch (err) {
      toast({
        title: "Report send error",
        description: err.message || "Please try again later.",
      });
    } finally {
      setSendingEmail(false);
    }
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
            {/* Automated Weekly Email Report Banner */}
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-semibold text-white">
                      Automated Weekly Email Report
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      Scheduled: Mondays at 9:00 AM
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/60 max-w-xl">
                    Pulls latest project progress, snapshots, and sales metric rows directly from your Google Sheets spreadsheet and delivers an executive recap via Gmail.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://docs.google.com/spreadsheets/d/1QnMJeXMSfKOPARATjAauMF3pKETVnapEGRzVE8jb-io/edit"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors"
                >
                  <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <button
                  onClick={handleSendWeeklyEmail}
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing & Sending...</span>
                    </>
                  ) : emailSentSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Again</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Report Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <GrowthStatsCards weekly={weekly} />
            <div className="mt-4">
              <PortfolioGrowthChart weekly={weekly} />
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StatusTrendChart weekly={weekly} />
              <ProgressTrendChart weekly={weekly} trends={trends} />
            </div>

            <AppFooter />
          </>
        )}
      </div>
    </div>
  );
}