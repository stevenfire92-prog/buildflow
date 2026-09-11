import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { label: t("nav.platform"), href: "#stack" },
    { label: t("nav.design"), href: "#design" },
    { label: t("nav.marketing"), href: "#marketing" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Se Fire Tech</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSelector />
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            {t("nav.login")}
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            {t("nav.startBuilding")}
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
              key={l.href}
              href={l.href}
              className="block px-3 py-2.5 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex gap-2">
            <Link to="/login" className="flex-1 text-center px-4 py-2.5 text-sm text-white border border-white/15 rounded-full">
              {t("nav.login")}
            </Link>
            <Link to="/dashboard" className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-black bg-white rounded-full">
              {t("nav.startBuilding")}
            </Link>
          </div>
          <div className="pt-1">
            <LanguageSelector className="w-full justify-center px-4 py-2.5 text-sm text-white/80 border border-white/15 rounded-full" />
          </div>
        </div>
      )}
    </header>
  );
}