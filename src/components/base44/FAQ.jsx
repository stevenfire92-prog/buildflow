import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What is Base44?",
    a: "Base44 is a no-code AI platform for building apps, websites and AI agents — no coding required. Describe what you want, and Base44 generates the structure, design and logic for you. It handles the technical side so you can focus on the idea.",
  },
  {
    q: "How does Base44 work?",
    a: "Base44 uses vibe coding to build apps, websites, agents and more. Describe your idea in plain language — as a rough thought or a detailed spec. Base44 generates the code, structure, design and logic. From there, keep iterating by chatting with the AI until everything works the way you want.",
  },
  {
    q: "How much does it cost?",
    a: "Base44 has a free plan — no credit card needed to start. The free plan includes monthly credits to build and test your first apps. Paid plans start at $16/month (billed annually) and unlock more credits, advanced features and team capabilities.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. Describe what you need in plain language and Base44 handles the rest.",
  },
  {
    q: "Which AI no-code platform is best to build an app?",
    a: "The best AI no-code platform is the one that can turn your idea into a fully functional app — not just a static design — without requiring any coding experience. Base44 covers full-stack generation, iteration speed, built-in hosting, integrations, and scalability out of the box.",
  },
  {
    q: "Can I build a complete website with Base44?",
    a: "Yes. Base44's AI website builder lets you generate a complete, fully functional website in minutes — just describe what you need in plain language. The AI handles layout, design, and content for you, with no coding or setup required.",
  },
];

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
  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-10">
          Frequently asked questions
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