import React, { useEffect, useState } from "react";
import { Rocket, Globe, LayoutTemplate, Users, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function OnboardingChecklist({ projects }) {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("bf_onboarding_dismissed") === "1"
  );
  const [templates, setTemplates] = useState(0);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    base44.entities.ProjectTemplate.list()
      .then((l) => setTemplates(l.length))
      .catch(() => setTemplates(0));
    base44.entities.User.list()
      .then((l) => setUsers(l.length))
      .catch(() => setUsers(0));
  }, []);

  if (dismissed || !projects) return null;

  const steps = [
    {
      label: t("ob.createProject"),
      done: projects.length > 0,
      icon: Rocket,
    },
    {
      label: t("ob.publishProject"),
      done: projects.some((p) => p.status === "published"),
      icon: Globe,
    },
    {
      label: t("ob.saveTemplate"),
      done: templates > 0,
      icon: LayoutTemplate,
    },
    {
      label: t("ob.inviteTeam"),
      done: users > 1,
      icon: Users,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  const dismiss = () => {
    localStorage.setItem("bf_onboarding_dismissed", "1");
    setDismissed(true);
  };

  if (doneCount === steps.length) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-white">{t("ob.title")}</h2>
          <p className="mt-1 text-xs text-white/45">{t("ob.subtitle")}</p>
        </div>
        <button
          onClick={dismiss}
          title={t("ob.dismiss")}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {steps.map(({ label, done, icon: Icon }) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
              done
                ? "bg-emerald-500/[0.06] border-emerald-500/20"
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                done
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/50"
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <p
              className={`text-sm ${
                done ? "text-white/60 line-through" : "text-white/80"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/35">
        {t("ob.of").replace("{done}", doneCount).replace("{total}", steps.length)}
      </p>
    </section>
  );
}