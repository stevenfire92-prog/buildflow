import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import PortfolioCard from "@/components/portfolio/PortfolioCard";
import ShareBar from "@/components/portfolio/ShareBar";

export default function Portfolio() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    base44.entities.Project.list("-updated_date", 100)
      .then((all) => setProjects(all.filter((p) => p.status === "published")))
      .catch(() => setProjects([]));
  }, []);

  const avg =
    projects && projects.length
      ? Math.round(
          projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="flex items-center gap-2 text-white">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="font-semibold tracking-tight">Se Fire Tech</span>
        </div>

        <div className="mt-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {t("pf.title")}
          </h1>
          <p className="mt-2 text-white/50">{t("pf.subtitle")}</p>
        </div>

        <ShareBar />

        {projects === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-white/60 font-medium">{t("pf.emptyTitle")}</p>
            <p className="mt-1 text-sm text-white/35">{t("pf.emptySub")}</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-xs text-white/45">{t("pf.statPublished")}</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {projects.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-xs text-white/45">{t("pf.statAvg")}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{avg}%</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <PortfolioCard key={p.id} project={p} />
              ))}
            </div>
          </>
        )}

        <p className="mt-12 text-xs text-white/30">
          {t("pf.footer")} · {t("footer.rights")}
        </p>
      </div>
    </div>
  );
}