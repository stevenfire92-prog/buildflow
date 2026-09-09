import React from "react";
import { FolderKanban, Hammer, Rocket } from "lucide-react";

export default function StatsRow({ projects }) {
  const total = projects.length;
  const building = projects.filter((p) => p.status === "building").length;
  const published = projects.filter((p) => p.status === "published").length;
  const avg = total
    ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / total)
    : 0;

  const stats = [
    { icon: FolderKanban, label: "Active projects", value: total, sub: `${building} currently building` },
    { icon: Hammer, label: "In build", value: building, sub: "across all types" },
    { icon: Rocket, label: "Published", value: published, sub: "live right now" },
    { icon: FolderKanban, label: "Avg. progress", value: `${avg}%`, sub: "across the portfolio" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-white/[0.03] border border-white/10 p-5"
        >
          <div className="flex items-center gap-2 text-white/50 mb-3">
            <s.icon className="w-4 h-4" />
            <span className="text-xs">{s.label}</span>
          </div>
          <div className="text-2xl font-semibold text-white">{s.value}</div>
          <p className="mt-1 text-[11px] text-white/35">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}