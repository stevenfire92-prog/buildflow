import React from "react";
import { Check } from "lucide-react";

export default function PlanCard({
  title,
  price,
  features,
  current,
  highlighted,
  onCta,
  ctaLabel,
  ctaLoading,
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlighted ? "border-white/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-white">{title}</h3>
        {current && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
            Current plan
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{price}</div>
      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/60">
            <Check className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <button
          disabled
          className="mt-6 w-full px-4 py-2.5 text-sm font-medium rounded-full bg-white/10 text-white/40 cursor-default"
        >
          Current plan
        </button>
      ) : (
        <button
          onClick={onCta}
          disabled={ctaLoading}
          className="mt-6 w-full px-4 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors disabled:opacity-60"
        >
          {ctaLoading ? "Starting checkout..." : ctaLabel}
        </button>
      )}
    </div>
  );
}