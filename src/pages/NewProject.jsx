import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activityLog";
import AppHeader from "@/components/AppHeader";
import TypeSelector from "@/components/projects/TypeSelector";
import { useToast } from "@/components/ui/use-toast";

const steps = ["Name", "Type", "Goals"];

export default function NewProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const initialName = urlParams.get("name") || urlParams.get("prompt") || "";
  const initialType = urlParams.get("type") || null;

  const [step, setStep] = useState(initialName && initialType ? 3 : initialName ? 2 : 1);
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(initialType);
  const [goals, setGoals] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creating, setCreating] = useState(false);

  const canContinue =
    (step === 1 && name.trim().length > 0) || (step === 2 && type !== null) || step === 3;

  const handleCreate = async () => {
    if (!name.trim() || !["app", "website", "agent", "game"].includes(type)) {
      toast({ title: "Complete the project name and type before continuing." });
      return;
    }
    setCreating(true);
    try {
      const project = await base44.entities.Project.create({
        name: name.trim(),
        project_type: type,
        goals: goals.trim(),
        description: description.trim(),
        ...(deadline ? { deadline } : {}),
        status: "draft",
        progress: 0,
        last_activity: new Date().toISOString(),
      });
      toast({ title: "Project created", description: `${project.name} is ready to build.` });
      logActivity({ action: "created", projectName: project.name, projectId: project.id });
      navigate(`/project-details?id=${project.id}`);
    } catch {
      toast({ title: "Could not create the project", description: "Your project was not saved. Check the connection and retry." });
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            New project
          </h1>
          <p className="mt-2 text-white/50">
            Three quick steps and your project is ready to build.
          </p>
        </div>

        <div className="mt-8 mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="contents">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  step > i ? "bg-white text-black" : "bg-white/10 text-white/50"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${step > i ? "text-white" : "text-white/40"}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/15 mx-1" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <label className="text-sm font-medium text-white/80">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fitness Tracker"
              className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/30"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-white/80">What are you building?</p>
            <div className="mt-3">
              <TypeSelector value={type} onChange={setType} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white/80">Initial goals</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={4}
                placeholder="What should this project accomplish?"
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A short summary of the project"
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Deadline <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? navigate("/dashboard") : setStep(step - 1))}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}