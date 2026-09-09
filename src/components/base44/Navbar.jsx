import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const links = [
  { label: "Developers", href: "#developers" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 text-white">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">base44</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <button className="ml-2 flex items-center gap-1 px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors">
            Resources <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="#login"
            className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            Log in
          </a>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            Start building
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-5 py-4 space-y-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="block px-3 py-2.5 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex gap-2">
            <a href="#login" className="flex-1 text-center px-4 py-2.5 text-sm text-white border border-white/15 rounded-full">
              Log in
            </a>
            <Link to="/dashboard" className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-black bg-white rounded-full">
              Start building
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}