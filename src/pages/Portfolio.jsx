import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Globe2, Sparkles, Layers, CheckCircle2, TrendingUp } from "lucide-react";
import { client } from "@/api/localClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import PortfolioCard from "@/components/portfolio/PortfolioCard";
import ShareBar from "@/components/portfolio/ShareBar";
import StanStoreCard from "@/components/portfolio/StanStoreCard";
import SheetsSalesActivityChart from "@/components/portfolio/SheetsSalesActivityChart";
import KindleBooks from "@/components/dashboard/KindleBooks";
import AppFooter from "@/components/AppFooter";

const tabs = ["all", "active", "ready", "published"];

export default function Portfolio() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [projects, setProjects] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    client.entities.Project.list("-updated_date", 100)
      .then(setProjects)
      .catch(() => setProjects([]));

    // Handle return from book purchase
    const urlParams = new URLSearchParams(window.location.search);
    const checkout = urlParams.get("checkout");
    const bookTitle = urlParams.get("book_title");
    const action = urlParams.get("action");
    if (checkout === "book_success") {
      toast({
        title: "Payment verification required",
        description: "Check your Stripe receipt. This return link alone does not confirm payment or access.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const tabLabels = {
    all: t("pf.tabAll"),
    active: t("pf.tabActive"),
    ready: t("pf.tabReady"),
    published: t("pf.tabPublished"),
  };

  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { total: 0, active: 0, published: 0, avg: 0 };
    }
    const total = projects.length;
    const active = projects.filter((p) => p.status === "building" || p.status === "draft").length;
    const published = projects.filter((p) => p.status === "published").length;
    const avg = Math.round(
      projects.reduce((s, p) => s + (p.progress || 0), 0) / total
    );
    return { total, active, published, avg };
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = projects;
    if (tab === "active") {
      list = list.filter((p) => p.status === "building" || p.status === "draft");
    } else if (tab === "ready") {
      list = list.filter((p) => p.status === "ready");
    } else if (tab === "published") {
      list = list.filter((p) => p.status === "published");
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.project_type || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, tab, search]);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-10">
        {/* Header navigation & Brand */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xs">S</span>
              </div>
              <span className="font-semibold tracking-tight">Se Fire Tech</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{t("pf.publicBadge")}</span>
            </div>
          </div>
        </div>

        {/* Hero title & intro */}
        <div className="mt-8 sm:mt-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Progress Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {t("pf.title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/50 leading-relaxed">
            {t("pf.subtitle")}
          </p>
        </div>

        {/* Share buttons */}
        <ShareBar />

        {/* Stat badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <Layers className="w-3.5 h-3.5 text-white/40" />
              <span>{t("pf.statTotal")}</span>
            </div>
            <p className="mt-1.5 text-2xl font-semibold text-white">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("pf.statActive")}</span>
            </div>
            <p className="mt-1.5 text-2xl font-semibold text-amber-300">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("pf.statPublished")}</span>
            </div>
            <p className="mt-1.5 text-2xl font-semibold text-emerald-300">
              {stats.published}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>{t("pf.statAvg")}</span>
            </div>
            <p className="mt-1.5 text-2xl font-semibold text-white">
              {stats.avg}%
            </p>
          </div>
        </div>

        {/* Google Sheets Book Sales & Activity Chart */}
        <div className="mt-8">
          <SheetsSalesActivityChart />
        </div>

        {/* Filters and search */}
        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {tabs.map((tb) => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  tab === tb
                    ? "bg-white text-black font-medium"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {tabLabels[tb]}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pf.searchPlaceholder")}
              className="w-48 sm:w-64 bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
            />
          </div>
        </div>

        {/* Content list / grid */}
        {projects === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-white/60 font-medium">{t("pf.emptyTitle")}</p>
            <p className="mt-1 text-sm text-white/35">{t("pf.emptySub")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 py-16 text-center">
            <p className="text-white/60 font-medium">
              {t("pf.noProjectsMatch")}
            </p>
            <p className="mt-1 text-sm text-white/35">
              {t("pf.noProjectsMatchSub")}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PortfolioCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Stan Store Showcase */}
        <div className="mt-12">
          <StanStoreCard />
        </div>

        {/* Published Books & Works with Integrated Bulk Update & Stripe Controls */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <KindleBooks />
        </div>

        <AppFooter />
      </div>
    </div>
  );
}