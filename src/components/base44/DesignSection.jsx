import React from "react";
import { Users, Video, Wand2, Palette } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DesignSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Users,
      title: t("design.f1Title"),
      desc: t("design.f1Desc"),
    },
    {
      icon: Video,
      title: t("design.f2Title"),
      desc: t("design.f2Desc"),
    },
    {
      icon: Wand2,
      title: t("design.f3Title"),
      desc: t("design.f3Desc"),
    },
    {
      icon: Palette,
      title: t("design.f4Title"),
      desc: t("design.f4Desc"),
    },
  ];

  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              {t("design.title")}{" "}
              <span className="text-white/40">{t("design.titleAccent")}</span>
            </h2>
            <p className="mt-5 text-lg text-white/60 leading-relaxed">
              {t("design.subtitle")}
            </p>
            <div className="mt-10 space-y-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 overflow-hidden">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border border-white/10 p-4 ${
                      i % 2 === 0
                        ? "bg-gradient-to-br from-violet-500/10 to-transparent"
                        : "bg-gradient-to-br from-blue-500/10 to-transparent"
                    }`}
                  >
                    <div className="h-24 rounded-xl bg-white/5 mb-3 flex items-center justify-center">
                      <Palette className="w-6 h-6 text-white/30" />
                    </div>
                    <div className="h-2 w-3/4 rounded-full bg-white/20 mb-1.5" />
                    <div className="h-2 w-1/2 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-500/80 border-2 border-black" />
                <div className="w-7 h-7 rounded-full bg-amber-400/80 border-2 border-black" />
                <div className="w-7 h-7 rounded-full bg-emerald-500/80 border-2 border-black" />
                <div className="w-7 h-7 rounded-full bg-sky-500/80 border-2 border-black" />
                <div className="w-7 h-7 rounded-full bg-violet-500/80 border-2 border-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}