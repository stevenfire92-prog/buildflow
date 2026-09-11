import React from "react";
import { Smartphone, Globe, Bot } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };

export default function PortfolioCard({ project }) {
  const { t } = useLanguage();
  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-white truncate">{project.name}</h3>
      </div>
      {project.description && (
        <p className="mt-3 text-sm text-white/50 line-clamp-3 whitespace-pre-wrap">
          {project.description}
        </p>
      )}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/40">
            {t("pf.built").replace("{n}", progress)}
          </span>
          <span className="text-xs font-medium text-white/70">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400/80"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}