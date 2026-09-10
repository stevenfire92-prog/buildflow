import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Globe, Bot } from "lucide-react";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };

export default function ProjectKanbanCard({ project }) {
  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));

  return (
    <Link
      to={`/project-details?id=${project.id}`}
      className="block rounded-xl bg-black/50 border border-white/10 p-3 hover:border-white/25 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white truncate">{project.name}</p>
        <Icon className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
      </div>
      {project.description && (
        <p className="mt-1 text-xs text-white/40 line-clamp-2">{project.description}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-white/35">{progress}%</span>
      </div>
    </Link>
  );
}