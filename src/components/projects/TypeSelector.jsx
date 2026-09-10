import React from "react";
import { Smartphone, Globe, Bot } from "lucide-react";

const types = [
  { value: "app", icon: Smartphone, title: "App", desc: "A mobile or web application" },
  { value: "website", icon: Globe, title: "Website", desc: "A marketing or content site" },
  { value: "agent", icon: Bot, title: "Agent", desc: "An AI assistant that works for you" },
];

export default function TypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {types.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`rounded-2xl border p-5 text-left transition-all ${
            value === t.value
              ? "border-white bg-white/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/30"
          }`}
        >
          <t.icon className="w-5 h-5 text-white/80" />
          <h3 className="mt-3 font-medium text-white">{t.title}</h3>
          <p className="mt-1 text-xs text-white/45">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}