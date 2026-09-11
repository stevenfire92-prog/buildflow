import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

export default function AppHeader({ backTo = "/dashboard", rightContent = null }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Link
          to={backTo}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2 text-white">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="font-semibold tracking-tight">Se Fire Tech</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightContent}
        <LanguageSelector />
      </div>
    </div>
  );
}