import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activityLog";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectEditForm({ project, onSaved, onCancel }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: project.name || "",
    project_type: project.project_type || "app",
    progress: Math.min(100, Math.max(0, project.progress || 0)),
    description: project.description || "",
    goals: project.goals || "",
    deadline: project.deadline || "",
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      const updated = await base44.entities.Project.update(project.id, {
        name: form.name.trim(),
        project_type: form.project_type,
        progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
        description: form.description,
        goals: form.goals,
        deadline: form.deadline || null,
        ...((project.deadline || "") !== (form.deadline || "")
          ? { deadline_alert_sent: "" }
          : {}),
        last_activity: new Date().toISOString(),
      });
      toast({ title: "Settings saved" });
      logActivity({ action: "updated", projectName: updated.name, projectId: project.id });
      onSaved(updated);
    } catch {
      toast({ title: "Could not save settings", description: "Please try again." });
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30";

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-white/50 mb-1.5 block">Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Type</label>
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
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Progress (0–100)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) => set("progress", e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-white/50 block">Deadline</label>
          <span className="text-[11px] text-emerald-400/90 font-medium">Auto-syncs to Google Calendar</span>
        </div>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Goals</label>
        <textarea
          value={form.goals}
          onChange={(e) => set("goals", e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}