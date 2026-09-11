import React, { useState } from "react";
import { 
  Check, 
  Layers, 
  Sparkles, 
  Clock, 
  Hammer, 
  CheckCircle2, 
  Rocket, 
  Sliders 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUS_CONFIGS = [
  {
    id: "draft",
    label: "Draft",
    icon: Clock,
    color: "border-white/20 text-white bg-white/5",
    activeColor: "border-white bg-white/15 text-white ring-2 ring-white/30",
    defaultProgress: 10,
    description: "Initial planning, architecture, and requirements gathering.",
  },
  {
    id: "building",
    label: "Building",
    icon: Hammer,
    color: "border-amber-500/30 text-amber-400 bg-amber-500/5",
    activeColor: "border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40",
    defaultProgress: 50,
    description: "Active development, feature coding, and iterative builds.",
  },
  {
    id: "ready",
    label: "Ready",
    icon: CheckCircle2,
    color: "border-sky-500/30 text-sky-400 bg-sky-500/5",
    activeColor: "border-sky-400 bg-sky-500/20 text-sky-300 ring-2 ring-sky-400/40",
    defaultProgress: 90,
    description: "QA testing, staging verification, and final review.",
  },
  {
    id: "published",
    label: "Published",
    icon: Rocket,
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    activeColor: "border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400/40",
    defaultProgress: 100,
    description: "Live in production and accessible to end-users.",
  },
];

export default function BulkStatusDialog({
  open,
  onOpenChange,
  selectedProjects = [],
  onSubmit,
  busy = false,
}) {
  const [selectedStatus, setSelectedStatus] = useState("building");
  const [adjustProgress, setAdjustProgress] = useState(false);
  const [customProgress, setCustomProgress] = useState(50);

  const count = selectedProjects.length;

  const handleSelectStatus = (statusId) => {
    setSelectedStatus(statusId);
    const cfg = STATUS_CONFIGS.find((c) => c.id === statusId);
    if (cfg) {
      setCustomProgress(cfg.defaultProgress);
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!selectedStatus || busy) return;
    const progressVal = adjustProgress ? Number(customProgress) : undefined;
    onSubmit(selectedStatus, progressVal);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-white/15 text-white max-w-lg sm:rounded-2xl p-5 sm:p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white tracking-tight">
              Update Status for {count} Project{count === 1 ? "" : "s"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50">
            Choose a new build status to assign to all selected projects simultaneously.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Projects Preview Strip */}
        <div className="my-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 max-h-28 overflow-y-auto">
          <p className="text-[11px] font-medium text-white/40 mb-2 uppercase tracking-wider">
            Selected projects ({count}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedProjects.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="max-w-[140px] truncate">{p.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Status Selection Cards */}
        <div className="space-y-2 mt-2">
          <label className="text-xs font-medium text-white/70 block">
            Target Status:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STATUS_CONFIGS.map((cfg) => {
              const Icon = cfg.icon;
              const isSelected = selectedStatus === cfg.id;
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => handleSelectStatus(cfg.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative ${
                    isSelected ? cfg.activeColor : `${cfg.color} hover:bg-white/[0.08]`
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{cfg.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5 leading-snug">
                      {cfg.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Progress Adjustment */}
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={adjustProgress}
                onChange={(e) => setAdjustProgress(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-black/40 text-amber-400 focus:ring-amber-400"
              />
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-white/50" />
                Also update completion progress
              </span>
            </label>
            {adjustProgress && (
              <span className="text-xs font-bold font-mono text-amber-400">
                {customProgress}%
              </span>
            )}
          </div>

          {adjustProgress && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={customProgress}
                onChange={(e) => setCustomProgress(Number(e.target.value))}
                className="w-full accent-amber-400 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40">
                <button
                  type="button"
                  onClick={() => setCustomProgress(0)}
                  className="hover:text-white"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => setCustomProgress(25)}
                  className="hover:text-white"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setCustomProgress(50)}
                  className="hover:text-white"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setCustomProgress(75)}
                  className="hover:text-white"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => setCustomProgress(100)}
                  className="hover:text-white"
                >
                  100%
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-5 flex gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={busy || count === 0}
            className="px-5 py-2 text-xs font-semibold text-black bg-white hover:bg-white/90 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {busy ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {busy ? "Updating..." : `Apply to ${count} Project${count === 1 ? "" : "s"}`}
            </span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}