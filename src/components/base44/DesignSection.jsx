import React from "react";
import { Users, Video, Wand2, Palette } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Seamlessly collaborate",
    desc: "See every page at once. Leave notes, sketch ideas, and send instructions straight to AI — all on one board.",
  },
  {
    icon: Video,
    title: "Generate high-quality videos",
    desc: "Describe a video, get one. Add it to any page — hero sections, onboarding screens, product previews.",
  },
  {
    icon: Wand2,
    title: "Get redesign recommendations",
    desc: "Ask for design options, pick the one you want. AI shows previews before it touches anything.",
  },
  {
    icon: Palette,
    title: "Control the design",
    desc: "Set colors and fonts for your entire app from one place. Your entire app — updated everywhere at once.",
  },
];

export default function DesignSection() {
  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              Beautiful by default.{" "}
              <span className="text-white/40">Yours by design.</span>
            </h2>
            <p className="mt-5 text-lg text-white/60 leading-relaxed">
              Base44 starts with designs that look good before you change a thing
              — and hold up just as well when you do.
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