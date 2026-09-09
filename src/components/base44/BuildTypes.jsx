import React from "react";
import { Smartphone, Globe, Bot, ArrowRight } from "lucide-react";

const types = [
  {
    icon: Smartphone,
    title: "Apps",
    desc: "Turn any idea into a fully functional app — with backend, auth, payments, and hosting already built in. No setup, no engineers, no waiting.",
    cta: "Build an app",
  },
  {
    icon: Globe,
    title: "Websites",
    desc: "Build a website for any need. AI-generated design, custom domain, built-in SEO tools — ready to go live from day one.",
    cta: "Build a website",
  },
  {
    icon: Bot,
    title: "AI agents",
    desc: "Create a 24/7 agent that connects to your tools, takes real action, and works while you sleep. No integration headaches.",
    cta: "Create an AI agent",
  },
];

export default function BuildTypes() {
  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            What will you build?
          </h2>
          <p className="mt-5 text-lg text-white/60">
            Whatever you're imagining, you can use vibe coding to build it on
            Base44.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {types.map((t) => (
            <div
              key={t.title}
              className="group relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 hover:border-white/25 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
                  <t.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{t.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed mb-6">{t.desc}</p>
                <a
                  href="#start"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2.5 transition-all"
                >
                  {t.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}