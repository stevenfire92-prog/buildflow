import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const statuses = [
  ["draft", "dash.tabDraft"],
  ["building", "dash.tabBuilding"],
  ["ready", "dash.tabReady"],
  ["published", "dash.tabPublished"],
];

export default function BulkActions({ count, busy, onSetStatus, onDelete, onCancel }) {
  const { t } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (busy) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    onDelete();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-lg px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur px-4 py-3 shadow-2xl flex-wrap">
        <span className="text-sm font-medium text-white shrink-0">
          {t("dash.selectedCount").replace("{n}", count)}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map(([s, key]) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => onSetStatus(s)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-full bg-white/5 text-white/70 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
            >
              {t(key)}
            </button>
          ))}
        </div>
        <button
          onClick={handleDelete}
          disabled={busy}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors disabled:opacity-60 shrink-0 ${
            confirmDelete
              ? "bg-red-500 text-white border-red-500"
              : "text-red-300 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? t("dash.confirmDelete") : t("dash.deleteSelected")}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          aria-label={t("dash.cancelSelection")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 disabled:opacity-60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}