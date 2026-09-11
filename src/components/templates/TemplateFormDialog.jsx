import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const empty = { name: "", project_type: "app", description: "", goals: "", tasks: "" };

export default function TemplateFormDialog({ open, onOpenChange, onSubmit, busy }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(empty);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      project_type: form.project_type,
      description: form.description.trim(),
      goals: form.goals.trim(),
      tasks: form.tasks.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{t("tpl.new")}</DialogTitle>
          <DialogDescription className="text-white/50">
            {t("tpl.formSubtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.name")}</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("tpl.namePlaceholder")}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.type")}</label>
            <select
              value={form.project_type}
              onChange={(e) => set("project_type", e.target.value)}
              className={`${inputCls} [&>option]:bg-black`}
            >
              <option value="app">App</option>
              <option value="website">Website</option>
              <option value="agent">Agent</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.description")}</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.goals")}</label>
            <textarea
              value={form.goals}
              onChange={(e) => set("goals", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.tasksLabel")}</label>
            <textarea
              value={form.tasks}
              onChange={(e) => set("tasks", e.target.value)}
              rows={4}
              placeholder={t("tpl.tasksHint")}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={busy || !form.name.trim()}
              className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {busy ? t("tpl.saving") : t("tpl.save")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}