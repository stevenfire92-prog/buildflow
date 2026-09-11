import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logActivity } from "@/lib/activityLog";
import AppHeader from "@/components/AppHeader";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateFormDialog from "@/components/templates/TemplateFormDialog";
import UseTemplateDialog from "@/components/templates/UseTemplateDialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Templates() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [useTarget, setUseTarget] = useState(null);
  const [using, setUsing] = useState(false);

  useEffect(() => {
    base44.entities.ProjectTemplate
      .list("-created_date", 100)
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      const created = await base44.entities.ProjectTemplate.create(data);
      setTemplates((prev) => [created, ...(prev || [])]);
      toast({ title: t("tpl.savedTitle"), description: t("tpl.savedDesc") });
      setFormOpen(false);
    } catch {
      toast({ title: t("tpl.failTitle"), description: t("dash.bulkFailDesc") });
    }
    setCreating(false);
  };

  const handleDelete = async (template) => {
    try {
      await base44.entities.ProjectTemplate.delete(template.id);
      setTemplates((prev) => (prev || []).filter((x) => x.id !== template.id));
      toast({ title: t("tpl.deletedTitle") });
    } catch {
      toast({ title: t("tpl.delFail") });
    }
  };

  const handleUse = async (template, name) => {
    setUsing(true);
    try {
      const project = await base44.entities.Project.create({
        name,
        description: template.description || "",
        goals: template.goals || "",
        project_type: template.project_type || "app",
        tasks: (template.tasks || []).map((title) => ({ title, done: false })),
        status: "draft",
        progress: 0,
        last_activity: new Date().toISOString(),
      });
      logActivity({ action: "created", projectName: project.name, projectId: project.id });
      navigate(`/project-details?id=${project.id}`);
    } catch {
      toast({ title: t("tpl.useFail") });
      setUsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6">
        <AppHeader />

        <div className="mt-10 mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t("tpl.title")}
            </h1>
            <p className="mt-2 text-white/50">{t("tpl.subtitle")}</p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> {t("tpl.new")}
          </button>
        </div>

        {templates === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-white/60 font-medium">{t("tpl.empty")}</p>
            <p className="mt-1 text-sm text-white/35">{t("tpl.emptySub")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onUse={(x) => setUseTarget(x)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        busy={creating}
      />
      <UseTemplateDialog
        template={useTarget}
        open={!!useTarget}
        onOpenChange={(o) => !o && setUseTarget(null)}
        onConfirm={handleUse}
        busy={using}
      />
    </div>
  );
}