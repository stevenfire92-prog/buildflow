import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Globe, Bot, MessageSquare, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ProjectComments from "./ProjectComments";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };
const statusStyles = {
  draft: "bg-white/10 text-white/70",
  building: "bg-amber-500/15 text-amber-400",
  ready: "bg-sky-500/15 text-sky-400",
  published: "bg-emerald-500/15 text-emerald-400",
};

const barFills = {
  draft: "bg-white/40",
  building: "bg-amber-400",
  ready: "bg-sky-400",
  published: "bg-emerald-400",
};

export default function ProjectCard({ project, selectable, selected, onToggle }) {
  const { t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));
  const updated = project.last_activity
    ? new Date(project.last_activity).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "—";

  return (
    <div
      className={`rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border transition-all relative group ${
        selected
          ? "border-amber-400/80 ring-2 ring-amber-400/30 bg-amber-500/[0.07] shadow-lg shadow-amber-500/5"
          : selectable
          ? "border-white/20 hover:border-white/40 cursor-pointer"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {/* Selection Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        aria-label={selected ? `Deselect ${project.name}` : `Select ${project.name}`}
        className={`absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
          selected
            ? "bg-amber-400 border-amber-300 text-black opacity-100 scale-100 shadow-md ring-2 ring-amber-400/40"
            : selectable
            ? "border-white/40 bg-zinc-900/80 text-transparent hover:border-amber-400 hover:text-amber-400/50 opacity-100"
            : "border-white/25 bg-zinc-900/80 text-transparent hover:border-white opacity-0 group-hover:opacity-100 scale-95 hover:scale-100"
        }`}
      >
        <Check className={`w-4 h-4 ${selected ? "stroke-[3] text-black" : ""}`} />
      </button>

      <Link
        to={`/project-details?id=${project.id}`}
        className="block p-5 pb-4"
        onClick={(e) => {
          if (!selectable) return;
          e.preventDefault();
          onToggle();
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
            <Icon className="w-5 h-5" />
          </div>
          {(() => {
            const nameLower = (project.name || "").toLowerCase();
            let appParam = "fitness";
            if (nameLower.includes("support")) appParam = "support";
            else if (nameLower.includes("expense")) appParam = "expenses";
            else if (nameLower.includes("habit")) appParam = "habits";
            return (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/apps?app=${appParam}`;
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 transition-colors"
                title="Launch full web app edition"
              >
                <Globe className="w-3 h-3" /> Web Live
              </span>
            );
          })()}
        </div>
        <h3 className="font-medium text-white truncate">{project.name}</h3>
        <p className="mt-1 text-xs text-white/45 line-clamp-2 min-h-[2rem]">
          {project.description || t("card.noDescription")}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${statusStyles[project.status] || statusStyles.draft}`}>
              {project.status}
            </span>
            <span className="text-white/40">{t("card.updated")} {updated}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barFills[project.status] || barFills.draft}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-white/30">{t("card.built").replace("{n}", progress)}</p>
        </div>
      </Link>

      <div className="px-5 pb-4">
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {t("card.comments")}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showComments ? "rotate-180" : ""}`} />
        </button>
        {showComments && (
          <ProjectComments projectId={project.id} projectName={project.name} />
        )}
      </div>
    </div>
  );
}