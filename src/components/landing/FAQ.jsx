import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base sm:text-lg font-medium text-white">{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70">
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm text-white/55 leading-relaxed max-w-3xl">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-10">
          {t("faq.title")}
        </h2>
        <div>
          {faqs.map((f) => (
            <Item key={f.q} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}