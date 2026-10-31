import React from "react";
import { Server, Plug, Globe, BarChart3, CreditCard, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function StackSection() {
  const { t } = useLanguage();

  const items = [
    { icon: Server, title: t("stack.backend"), href: "#developers" },
    { icon: Plug, title: t("stack.integrations"), href: "#integrations" },
    { icon: Globe, title: t("stack.domain"), href: "#domain" },
    { icon: BarChart3, title: t("stack.analytics"), href: "#analytics" },
    { icon: CreditCard, title: t("stack.payments"), href: "#payments" },
    { icon: ShieldCheck, title: t("stack.security"), href: "#security" },
  ];

  return (
    <section className="bg-black py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
            {t("stack.title")}{" "}
            <span className="text-white/40">{t("stack.titleAccent")}</span>
          </h2>
          <p className="mt-5 text-lg text-white/60 leading-relaxed">
            {t("stack.subtitle")}
          </p>
        </div>

        <div className="mt-12 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent">
          <div className="aspect-[2/1] w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-2xl">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="group flex items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white transition-colors">
                <it.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors flex-1">
                {it.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}