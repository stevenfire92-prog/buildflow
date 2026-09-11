import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const cols = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.aiAppBuilder"), href: "#build" },
        { label: t("footer.aiWebsiteBuilder"), href: "#build" },
        { label: t("footer.aiAgents"), href: "#build" },
        { label: t("footer.integrations"), href: "#stack" },
        { label: t("footer.pricing"), href: "#pricing" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.documentation"), href: "#stack" },
        { label: t("footer.blog"), href: "#faq" },
        { label: t("footer.caseStudies"), href: "#marketing" },
        { label: t("footer.community"), href: "#faq" },
        { label: t("footer.changelog"), href: "#design" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.about"), href: "#stack" },
        { label: t("footer.careers"), href: "#marketing" },
        { label: t("footer.security"), href: "#stack" },
        { label: t("footer.contact"), href: "#faq" },
        { label: t("footer.terms"), href: "#faq" },
      ],
    },
  ];

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">Se Fire Tech</span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium text-white mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start font-medium text-white/90">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t("footer.rights")}</span>
            </div>
            <p className="mt-1 text-white/70 font-medium">{t("footer.designedBy")}</p>
            <p className="mt-0.5 text-[11px] text-white/50">
              BuildFlow™ platform, all proprietary code, music catalog & Shadow Path dark fantasy series are protected by copyright.
            </p>
          </div>
          <div className="flex gap-5 text-xs text-white/60">
            <a href="#faq" className="hover:text-white transition-colors">{t("footer.privacy")}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t("footer.terms")}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t("footer.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}