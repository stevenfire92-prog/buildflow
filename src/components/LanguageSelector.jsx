import React, { useMemo, useState } from "react";
import { Globe, Search, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { COUNTRIES, flagFor } from "@/lib/i18n/countries";
import { LANGUAGES, languageName, nativeLanguageName } from "@/lib/i18n/languages";

export default function LanguageSelector({ className }) {
  const { lang, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("country");
  const [query, setQuery] = useState("");

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.lang === q
    );
  }, [query]);

  const filteredLanguages = useMemo(() => {
    const items = LANGUAGES.map((code) => ({
      code,
      name: languageName(code),
      native: nativeLanguageName(code),
    }));
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code === q
    );
  }, [query]);

  const pick = (code) => {
    setLanguage(code);
    setOpen(false);
    setQuery("");
  };

  const rowClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
      active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ||
          "flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
        }
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase font-medium">{lang}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="text-white">{t("lang.title")}</DialogTitle>
            <p className="text-sm text-white/50">{t("lang.subtitle")}</p>
          </DialogHeader>

          <div className="px-5 space-y-3">
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setMode("country")}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-colors ${
                  mode === "country" ? "bg-white text-black font-medium" : "text-white/60 hover:text-white"
                }`}
              >
                {t("lang.countries")}
              </button>
              <button
                onClick={() => setMode("language")}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-colors ${
                  mode === "language" ? "bg-white text-black font-medium" : "text-white/60 hover:text-white"
                }`}
              >
                {t("lang.allLanguages")}
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("lang.searchPlaceholder")}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
              />
            </div>
          </div>

          <div className="max-h-[45vh] overflow-y-auto px-5 pb-5 mt-1">
            {mode === "country" ? (
              <div className="space-y-0.5">
                {filteredCountries.map((c) => (
                  <button key={c.code} onClick={() => pick(c.lang)} className={rowClass(lang === c.lang)}>
                    <span className="text-lg leading-none w-6 text-center">{flagFor(c.code)}</span>
                    <span className="flex-1 text-sm truncate">{c.name}</span>
                    <span className="text-xs text-white/35 truncate max-w-[110px]">
                      {nativeLanguageName(c.lang)}
                    </span>
                    {lang === c.lang && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredLanguages.map((l) => (
                  <button key={l.code} onClick={() => pick(l.code)} className={rowClass(lang === l.code)}>
                    <span className="text-sm font-medium text-white/50 uppercase w-6 shrink-0">
                      {l.code.slice(0, 2)}
                    </span>
                    <span className="flex-1 text-sm truncate">{l.name}</span>
                    <span className="text-xs text-white/35 truncate max-w-[110px]">{l.native}</span>
                    {lang === l.code && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}