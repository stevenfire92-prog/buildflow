import React from "react";
import { X, Smartphone, Globe, Bot, CalendarDays, CheckCircle2, Circle, Target, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };

const statusStyles = {
  draft: "bg-white/10 text-white/70 border-white/15",
  building: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ready: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export default function PublicProjectDialog({ project, open, onOpenChange }) {
  const { t } = useLanguage();
  if (!project) return null;

  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));
  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((task) => task.done).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e0e10] border-white/10 text-white max-w-lg p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">
                {project.name}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${
                    statusStyles[project.status] || statusStyles.draft
                  }`}
                >
                  {project.status || "draft"}
                </span>
                <span className="text-xs text-white/40 capitalize">
                  {project.project_type || "app"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/50">{t("pf.built").replace("{n}", progress)}</span>
            <span className="font-semibold text-emerald-400">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Deadline & Meta */}
        {project.deadline && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/70 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl">
            <CalendarDays className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              {t("pf.launchTarget")}:{" "}
              <strong className="text-white">
                {new Date(`${String(project.deadline).slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </span>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              {t("pf.projectOverview")}
            </h4>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}

        {/* Goals */}
        {project.goals && (
          <div className="mt-4">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              <Target className="w-3.5 h-3.5" /> {t("pf.goals")}
            </h4>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
              {project.goals}
            </p>
          </div>
        )}

        {/* Tasks / Milestones */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {t("pf.checklist")}
              </h4>
              <span className="text-xs text-white/50">
                {t("pf.tasksDone")
                  .replace("{done}", completedTasks)
                  .replace("{total}", tasks.length)}
              </span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  )}
                  <span className={task.done ? "line-through text-white/40" : "text-white/80"}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          {(() => {
            const nameLower = (project.name || "").toLowerCase();
            let appParam = "fitness";
            if (nameLower.includes("support")) appParam = "support";
            else if (nameLower.includes("expense")) appParam = "expenses";
            else if (nameLower.includes("habit")) appParam = "habits";
            return (
              <a
                href={`/apps?app=${appParam}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Launch Web Edition</span>
              </a>
            );
          })()}

          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}