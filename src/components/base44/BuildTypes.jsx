import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Globe, Bot, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BuildTypes() {
  const { t } = useLanguage();

  const types = [
    {
      icon: Smartphone,
      title: t("build.appTitle"),
      desc: t("build.appDesc"),
      cta: t("build.appCta"),
      to: "/new-project?type=app",
    },
    {
      icon: Globe,
      title: t("build.webTitle"),
      desc: t("build.webDesc"),
      cta: t("build.webCta"),
      to: "/new-project?type=website",
    },
    {
      icon: Bot,
      title: t("build.agentTitle"),
      desc: t("build.agentDesc"),
      cta: t("build.agentCta"),
      to: "/new-project?type=agent",
    },
  ];

  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            {t("build.title")}
          </h2>
          <p className="mt-5 text-lg text-white/60">
            {t("build.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {types.map((type) => (
            <div
              key={type.title}
              className="group relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 hover:border-white/25 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                  <type.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{type.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed mb-6">{type.desc}</p>
                <Link
                  to={type.to}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2.5 transition-all"
                >
                  {type.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}