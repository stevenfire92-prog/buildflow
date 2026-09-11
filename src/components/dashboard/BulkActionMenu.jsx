import React, { useState } from "react";
import { 
  CheckSquare, 
  Square, 
  MinusSquare, 
  ChevronDown, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  AlertTriangle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  { id: "draft", labelKey: "dash.tabDraft", color: "bg-white/20 text-white border-white/20" },
  { id: "building", labelKey: "dash.tabBuilding", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "ready", labelKey: "dash.tabReady", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { id: "published", labelKey: "dash.tabPublished", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
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

  const count = selection.length;
  const allSelected = totalVisible > 0 && count >= totalVisible;
  const partiallySelected = count > 0 && count < totalVisible;

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDelete();
  };

  if (!isFloating && !selectMode && count === 0) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSelectMode}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
          title="Select multiple projects"
        >
          <Square className="w-3.5 h-3.5 text-white/40" />
          <span>{t("dash.select") || "Select"}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex items-center gap-2 sm:gap-3 flex-wrap ${
          isFloating
            ? "rounded-2xl border border-white/20 bg-zinc-950/95 backdrop-blur-md px-4 py-3 shadow-2xl"
            : "rounded-xl border border-white/15 bg-white/[0.04] p-2.5 sm:px-4 sm:py-2.5 transition-all"
        }`}
      >
        {/* Select All Checkbox / Toggle */}
        <button
          onClick={onSelectAll}
          disabled={busy || totalVisible === 0}
          className="flex items-center gap-2 text-xs font-medium text-white/90 hover:text-white transition-colors"
          title={allSelected ? (t("dash.deselectAll") || "Deselect all") : (t("dash.selectAll") || "Select all")}
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-white" />
          ) : partiallySelected ? (
            <MinusSquare className="w-4 h-4 text-white/70" />
          ) : (
            <Square className="w-4 h-4 text-white/40" />
          )}
          <span className="hidden sm:inline">
            {allSelected
              ? (t("dash.deselectAll") || "Deselect all")
              : `${t("dash.selectAll") || "Select all"} (${totalVisible})`}
          </span>
        </button>

        {/* Selected Counter Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white">
          <span>{count}</span>
          <span className="text-white/60 font-normal">
            {t("dash.selectedCount")?.replace("{n}", "") || "selected"}
          </span>
        </div>

        <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

        {/* Bulk Action Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={busy || count === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t("dash.bulkActions") || "Bulk Actions"}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 bg-zinc-950 border border-white/15 text-white p-1.5 rounded-xl shadow-xl z-50"
          >
            <DropdownMenuLabel className="text-[11px] font-semibold text-white/40 px-2 py-1 tracking-wider uppercase">
              {t("dash.updateStatus") || "Update Status"}
            </DropdownMenuLabel>
            {statusOptions.map(({ id, labelKey }) => (
              <DropdownMenuItem
                key={id}
                onClick={() => onSetStatus(id)}
                className="flex items-center justify-between px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <span>{t(labelKey)}</span>
                <span className="text-[10px] text-white/40 capitalize">{id}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="bg-white/10 my-1" />

            <DropdownMenuLabel className="text-[11px] font-semibold text-red-400/80 px-2 py-1 tracking-wider uppercase">
              {t("dash.dangerZone") || "Danger Zone"}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>
                {t("dash.deleteSelected") || "Delete"} ({count})
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Status Pills on larger screens */}
        <div className="hidden lg:flex items-center gap-1">
          {statusOptions.map(({ id, labelKey, color }) => (
            <button
              key={id}
              disabled={busy || count === 0}
              onClick={() => onSetStatus(id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all disabled:opacity-40 hover:scale-105 ${color}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Direct Delete Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={busy || count === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
          title={t("dash.deleteSelected") || "Delete selected"}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("dash.deleteSelected") || "Delete"}</span>
        </button>

        {/* Cancel / Clear Selection */}
        <button
          onClick={onClearSelection}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-auto shrink-0"
          title={t("dash.cancelSelection") || "Cancel selection"}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-zinc-950 border border-white/15 text-white max-w-md sm:rounded-2xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              {t("dash.deleteConfirmTitle") || "Delete selected projects?"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/60 mt-1">
              {t("dash.deleteConfirmDesc")?.replace("{n}", count) || 
                `Are you sure you want to permanently delete ${count} selected project(s)? This action cannot be undone.`}
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
              onClick={() => setShowDeleteModal(false)}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
              {t("dash.cancel") || "Cancel"}
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {busy ? "Deleting..." : `${t("dash.deleteSelected") || "Delete"} ${count} ${count === 1 ? "Project" : "Projects"}`}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}