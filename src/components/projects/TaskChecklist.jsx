import React, { useState } from "react";
import { CheckSquare, Check } from "lucide-react";
import { client } from "@/api/localClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export default function TaskChecklist({ projectId, tasks, onUpdated }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  const toggle = async (index) => {
    if (busy) return;
    const next = tasks.map((tk, i) => (i === index ? { ...tk, done: !tk.done } : tk));
    setBusy(true);
    try {
      const updated = await client.entities.Project.update(projectId, {
        tasks: next,
        last_activity: new Date().toISOString(),
      });
      onUpdated(updated);
    } catch {
      toast({ title: t("proj.taskFail") });
    }
    setBusy(false);
  };

  const doneCount = tasks.filter((tk) => tk.done).length;

  return (
    <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/50 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5" /> {t("proj.tasks")}
        </p>
        <span className="text-xs text-white/40">
          {t("proj.tasksDone").replace("{done}", doneCount).replace("{total}", tasks.length)}
        </span>
      </div>
      <ul className="space-y-1.5">
        {tasks.map((tk, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              disabled={busy}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors disabled:opacity-60"
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  tk.done ? "bg-white border-white text-black" : "border-white/30 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className={`text-sm ${tk.done ? "text-white/40 line-through" : "text-white/80"}`}>
                {tk.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}