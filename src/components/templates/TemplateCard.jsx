import React, { useState } from "react";
import { Smartphone, Globe, Bot, Trash2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };

export default function TemplateCard({ template, onUse, onDelete }) {
  const { t } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = typeIcons[template.project_type] || Smartphone;
  const tasks = template.tasks || [];

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    onDelete(template);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-white/25 transition-all p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
          <Icon className="w-5 h-5" />
        </div>
        {tasks.length > 0 && (
          <span className="text-xs text-white/50">
            {t("tpl.taskCount").replace("{n}", tasks.length)}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-medium text-white truncate">{template.name}</h3>
      <p className="mt-1 text-xs text-white/45 line-clamp-2 min-h-[2rem]">
        {template.description || t("card.noDescription")}
      </p>
      {tasks.length > 0 && (
        <ul className="mt-3 space-y-1">
          {tasks.slice(0, 4).map((task, i) => (
            <li key={i} className="text-xs text-white/50 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
              <span className="truncate">{task}</span>
            </li>
          ))}
          {tasks.length > 4 && (
            <li className="text-xs text-white/30">+{tasks.length - 4}</li>
          )}
        </ul>
      )}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onUse(template)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
        >
          {t("tpl.use")} <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${
            confirmDelete
              ? "bg-red-500 text-white border-red-500"
              : "text-red-300 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? t("tpl.confirmDelete") : t("tpl.delete")}
        </button>
      </div>
    </div>
  );
}