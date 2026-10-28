import React, { useState } from "react";
import { 
  CheckSquare, 
  Square, 
  MinusSquare, 
  Trash2, 
  X, 
  Layers, 
  AlertTriangle,
  Sliders
} from "lucide-react";
import BulkStatusDialog from "./BulkStatusDialog";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const statusOptions = [
  { id: "draft", label: "Draft", labelKey: "dash.tabDraft", color: "bg-white/10 text-white/80 border-white/20 hover:bg-white/20", dot: "bg-white/60" },
  { id: "building", label: "Building", labelKey: "dash.tabBuilding", color: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25", dot: "bg-amber-400" },
  { id: "ready", label: "Ready", labelKey: "dash.tabReady", color: "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25", dot: "bg-sky-400" },
  { id: "published", label: "Published", labelKey: "dash.tabPublished", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25", dot: "bg-emerald-400" },
];

export default function BulkActionMenu({
  selection = [],
  totalVisible = 0,
  selectedProjects = [],
  busy = false,
  onSelectAll,
  onSetStatus,
  onDelete,
  onClearSelection,
  selectMode = false,
  onToggleSelectMode,
  isFloating = false,
}) {
  const { t } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const count = selection.length;
  const allSelected = totalVisible > 0 && count >= totalVisible;
  const partiallySelected = count > 0 && count < totalVisible;

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDelete();
  };

  const handleCustomStatusApply = (status, progress) => {
    setShowStatusModal(false);
    onSetStatus(status, progress);
  };

  if (!isFloating && !selectMode && count === 0) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSelectMode}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm"
          title="Select multiple projects to update statuses together"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Bulk Select & Update</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex items-center gap-2 sm:gap-3 flex-wrap ${
          isFloating
            ? "rounded-2xl border border-white/20 bg-zinc-950/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl"
            : "rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-2.5 sm:px-4 sm:py-2.5 transition-all w-full"
        }`}
      >
        {/* Select All Checkbox / Toggle */}
        <button
          type="button"
          onClick={onSelectAll}
          disabled={busy || totalVisible === 0}
          className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-amber-300 transition-colors"
          title={allSelected ? "Deselect all" : "Select all visible"}
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-amber-400" />
          ) : partiallySelected ? (
            <MinusSquare className="w-4 h-4 text-amber-300" />
          ) : (
            <Square className="w-4 h-4 text-white/50" />
          )}
          <span className="text-[11px] sm:text-xs">
            {allSelected ? "Deselect All" : `Select All (${totalVisible})`}
          </span>
        </button>

        {/* Selected Counter Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold text-white">
          <span className="text-amber-300 font-bold">{count}</span>
          <span className="text-white/60 font-normal">
            {count === 1 ? "project" : "projects"} selected
          </span>
        </div>

        <div className="h-4 w-px bg-white/15 mx-0.5 hidden sm:block" />

        {/* Direct 1-Click Status Update Buttons (Mobile + Desktop) */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mr-1 hidden sm:inline">
            Set Status:
          </span>
          {statusOptions.map(({ id, label, color, dot }) => (
            <button
              key={id}
              type="button"
              disabled={busy || count === 0}
              onClick={() => onSetStatus(id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 ${color}`}
              title={`Move selected projects to ${label}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Modal / Advanced Status Update Dialog */}
        <button
          type="button"
          disabled={busy || count === 0}
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-30 shadow-sm"
          title="Open advanced status and progress update dialog"
        >
          <Sliders className="w-3 h-3" />
          <span className="hidden sm:inline">Advanced</span>
        </button>

        {/* Direct Delete Button */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={busy || count === 0}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-30 ml-auto sm:ml-0"
          title="Delete selected projects"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        {/* Cancel / Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={busy}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-auto shrink-0"
          title="Done selecting / Exit"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advanced Bulk Status Dialog */}
      <BulkStatusDialog
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        selectedProjects={selectedProjects}
        onSubmit={handleCustomStatusApply}
        busy={busy}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-zinc-950 border border-white/15 text-white max-w-md sm:rounded-2xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              Delete selected projects?
            </DialogTitle>
            <DialogDescription className="text-sm text-white/60 mt-1">
              Are you sure you want to permanently delete {count} selected project{count === 1 ? "" : "s"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedProjects.length > 0 && (
            <div className="my-2 max-h-36 overflow-y-auto space-y-1 rounded-xl bg-white/5 border border-white/10 p-3">
              {selectedProjects.map((p) => (
                <div key={p.id} className="text-xs text-white/80 flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {busy ? "Deleting..." : `Delete ${count} Project${count === 1 ? "" : "s"}`}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}