import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function UseTemplateDialog({ template, open, onOpenChange, onConfirm, busy }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");

  useEffect(() => {
    if (template) setName(template.name);
  }, [template]);

  const handleConfirm = () => {
    if (!name.trim() || busy) return;
    onConfirm(template, name.trim());
  };

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{t("tpl.useTitle")}</DialogTitle>
          <DialogDescription className="text-white/50">
            {t("tpl.useSubtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">{t("tpl.projectName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </div>
          {(template?.tasks || []).length > 0 && (
            <p className="text-xs text-white/40">
              {t("tpl.useHint").replace("{n}", template.tasks.length)}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={busy || !name.trim()}
              className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {busy ? t("tpl.creating") : t("tpl.createProject")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}