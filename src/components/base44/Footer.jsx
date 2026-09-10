import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const cols = [
    {
      title: t("footer.product"),
      links: [
        t("footer.aiAppBuilder"),
        t("footer.aiWebsiteBuilder"),
        t("footer.aiAgents"),
        t("footer.integrations"),
        t("footer.pricing"),
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        t("footer.documentation"),
        t("footer.blog"),
        t("footer.caseStudies"),
        t("footer.community"),
        t("footer.changelog"),
      ],
    },
    {
      title: t("footer.company"),
      links: [
        t("footer.about"),
        t("footer.careers"),
        t("footer.security"),
        t("footer.contact"),
        t("footer.terms"),
      ],
    },
  ];

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">Se Fire Tech</span>
            </a>
            <p className="text-sm text-white/40 max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium text-white mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/40 text-center sm:text-left">
            <p>{t("footer.rights")}</p>
            <p className="mt-1">{t("footer.designedBy")}</p>
          </div>
          <div className="flex gap-5 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}