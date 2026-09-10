import React from "react";

const cols = [
  {
    title: "Product",
    links: ["AI App Builder", "AI Website Builder", "AI Agents", "Integrations", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Blog", "Case Studies", "Community", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Security", "Contact", "Terms"],
  },
];

export default function Footer() {
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
              Every builder needs a base. Build apps, websites and AI agents with
              your own words.
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
            <p>© 2026 Se Fire Tech. All rights reserved.</p>
            <p className="mt-1">Designed &amp; built by Steven Turcott</p>
          </div>
          <div className="flex gap-5 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}