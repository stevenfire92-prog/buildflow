import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function BulkDeleteBooksDialog({
  open,
  onOpenChange,
  selectedBooks = [],
  onConfirm,
  busy = false,
}) {
  const count = selectedBooks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <DialogTitle className="text-white text-base">
              Delete Selected Books?
            </DialogTitle>
          </div>
          <DialogDescription className="text-white/60 text-xs pt-1">
            Are you sure you want to delete {count} selected book{count !== 1 ? "s" : ""}? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5 my-2">
          {selectedBooks.map((b) => (
            <div key={b.id} className="text-xs text-white/80 truncate flex items-center gap-2">
              <span className="text-red-400">•</span>
              <span className="text-amber-400 font-bold">#{b.series_order || "•"}</span>
              <span>{b.title}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="px-3.5 py-1.5 text-xs text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-full transition-colors disabled:opacity-50"
          >
            {busy ? "Deleting..." : `Delete ${count} Books`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}