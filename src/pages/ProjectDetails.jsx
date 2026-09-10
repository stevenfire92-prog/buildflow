import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Globe, Bot, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activityLog";
import AppHeader from "@/components/AppHeader";
import ProjectEditForm from "@/components/projects/ProjectEditForm";
import ProjectFiles from "@/components/projects/ProjectFiles";
import { useToast } from "@/components/ui/use-toast";

const typeIcons = { app: Smartphone, website: Globe, agent: Bot };
const statuses = ["draft", "building", "ready", "published"];
const statusStyles = {
  draft: "bg-white/10 text-white/70",
  building: "bg-amber-500/15 text-amber-400",
  ready: "bg-sky-500/15 text-sky-400",
  published: "bg-emerald-500/15 text-emerald-400",
};

export default function ProjectDetails() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!id) {
      setProject(null);
      return;
    }
    base44.entities.Project.get(id).then(setProject).catch(() => setProject(null));
  }, [id]);

  const handleStatus = async (status) => {
    const prev = project;
    setProject({ ...project, status });
    try {
      await base44.entities.Project.update(id, {
        status,
        last_activity: new Date().toISOString(),
      });
      toast({ title: "Status updated", description: `Moved to ${status}.` });
      logActivity({
        action: "status_changed",
        projectName: project.name,
        projectId: id,
        details: `moved to ${status}`,
      });
    } catch {
      setProject(prev);
      toast({ title: "Could not update status", description: "Please try again." });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    setDeleting(true);
    try {
      const name = project.name;
      await base44.entities.Project.delete(id);
      toast({ title: "Project deleted", description: `${name} has been removed.` });
      logActivity({ action: "deleted", projectName: name, projectId: id });
      navigate("/dashboard");
    } catch {
      toast({ title: "Could not delete the project", description: "Please try again." });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-2xl px-5 sm:px-8 py-6">
          <AppHeader />
          <div className="mt-16 text-center">
            <h1 className="text-2xl font-semibold text-white">Project not found</h1>
            <p className="mt-2 text-white/50">It may have been deleted.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[project.project_type] || Smartphone;
  const progress = Math.min(100, Math.max(0, project.progress || 0));
  const created = project.created_date
    ? new Date(project.created_date).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const updated = project.updated_date
    ? new Date(project.updated_date).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {project.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    statusStyles[project.status] || statusStyles.draft
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/40 capitalize">
                {project.project_type} · created {created} · updated {updated}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit settings
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full transition-colors disabled:opacity-60 ${
                confirmDelete
                  ? "bg-red-500 text-white border-red-500"
                  : "text-red-300 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Deleting..." : confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Build progress</span>
            <span className="text-sm font-medium text-white">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-white/70" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <p className="text-xs text-white/50 mb-3">Status</p>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className={`px-4 py-1.5 text-sm rounded-full capitalize transition-colors ${
                  project.status === s
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {editing && (
          <div className="mt-4">
            <ProjectEditForm
              project={project}
              onSaved={(p) => {
                setProject(p);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <p className="text-xs text-white/50 mb-2">Description</p>
            <p className="text-sm text-white/70 whitespace-pre-wrap">
              {project.description || "No description yet."}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <p className="text-xs text-white/50 mb-2">Goals</p>
            <p className="text-sm text-white/70 whitespace-pre-wrap">
              {project.goals || "No goals defined yet."}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProjectFiles projectId={id} projectName={project.name} />
        </div>
      </div>
    </div>
  );
}