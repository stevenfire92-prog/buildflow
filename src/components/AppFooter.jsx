import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Copyright } from "lucide-react";

export default function AppFooter({ className = "" }) {
  return (
    <footer className={`mt-16 pt-8 pb-10 border-t border-white/10 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-[11px]">S</span>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1.5 flex-wrap font-medium text-white/90">
              <Copyright className="w-3.5 h-3.5 text-white/70" />
              <span>2026 Se Fire Tech. All rights reserved.</span>
              <span className="hidden sm:inline text-white/30">·</span>
              <span className="text-amber-400/90 font-medium">BuildFlow™</span>
            </div>
            <p className="mt-0.5 text-white/60">
              Designed & built by Steven Turcott — Founder of Se Fire Tech. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/60 text-xs flex-wrap justify-center sm:justify-end">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/portfolio" className="hover:text-white transition-colors">
            Public Portfolio
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <a
            href="https://www.amazon.com/dp/B0GX2WYHTH"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Shadow Path Series
          </a>
        </div>
      </div>
    </footer>
  );
}