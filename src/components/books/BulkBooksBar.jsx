import React from "react";
import { Check, Edit3, Trash2, X } from "lucide-react";

export default function BulkBooksBar({
  selectionCount,
  totalCount,
  onSelectAll,
  onOpenBulkEdit,
  onOpenDeleteConfirm,
  onExit,
}) {
  const isAllSelected = selectionCount === totalCount && totalCount > 0;

  return (
    <div className="mt-4 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onSelectAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isAllSelected ? "Deselect All" : `Select All (${totalCount})`}</span>
        </button>
        <span className="px-2.5 py-1 rounded-full bg-amber-400 text-black text-xs font-bold">
          {selectionCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          disabled={selectionCount === 0}
          onClick={onOpenBulkEdit}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Bulk Edit Prices & Metadata</span>
        </button>

        <button
          type="button"
          disabled={selectionCount === 0}
          onClick={onOpenDeleteConfirm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={onExit}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}