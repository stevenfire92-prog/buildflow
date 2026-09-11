import React, { useState } from "react";
import { Smartphone, Globe, Bot, CalendarDays, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import PublicProjectDialog from "@/components/portfolio/PublicProjectDialog";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };

const statusLabels = {
  draft: "Draft",
  building: "In build",
  ready: "Ready",
  published: "Published",
};

const statusStyles = {
  draft: "bg-white/5 text-white/60 border-white/10",
  building: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  ready: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  published: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
};

export default function PortfolioCard({ project }) {
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));

  const tasks = project.tasks || [];
  const completed = tasks.filter((t) => t.done).length;

  return (
    <>
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-200">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-white truncate text-base">
                  {project.name}
                </h3>
                <span className="text-xs text-white/40 capitalize">
                  {project.project_type || "app"}
                </span>
              </div>
            </div>
            <span
              className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-medium border capitalize ${
                statusStyles[project.status] || statusStyles.draft
              }`}
            >
              {statusLabels[project.status] || project.status || "Draft"}
            </span>
          </div>

          {project.description && (
            <p className="mt-3 text-sm text-white/60 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Deadline or tasks chip */}
          <div className="mt-3 flex items-center gap-3 text-xs text-white/40 flex-wrap">
            {project.deadline && (
              <span className="inline-flex items-center gap-1.5 text-white/60">
                <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                {new Date(
                  `${String(project.deadline).slice(0, 10)}T00:00:00`
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {tasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-white/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {completed}/{tasks.length} tasks
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-white/45">
              {t("pf.built").replace("{n}", progress)}
            </span>
            <span className="font-medium text-emerald-400">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              {t("pf.viewDetails")} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <PublicProjectDialog
        project={project}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}