import React, { useMemo, useState } from "react";
import { Globe, Search, Check, Sparkles, Volume2, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { COUNTRIES, flagFor } from "@/lib/i18n/countries";
import { LANGUAGES, languageName, nativeLanguageName, REGIONAL_ACCENTS } from "@/lib/i18n/languages";

export default function LanguageSelector({ className }) {
  const { lang, setLanguage, accent, setAccent, activeAccent, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("accents"); // "accents" | "languages" | "countries"
  const [query, setQuery] = useState("");
  const [previewingAccent, setPreviewingAccent] = useState(null);

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

  const filteredAccents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REGIONAL_ACCENTS;
    return REGIONAL_ACCENTS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        languageName(a.lang).toLowerCase().includes(q)
    );
  }, [query]);

  const pickLanguage = (code) => {
    setLanguage(code);
    setOpen(false);
    setQuery("");
  };

  const pickAccent = (accentObj) => {
    setAccent(accentObj.id);
    setOpen(false);
    setQuery("");
  };

  const playAccentPreview = (e, acc) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setPreviewingAccent(acc.id);

    const text =
      acc.lang === "en"
        ? `Hello, I'm Steven Turcott. Welcome to Builder Flow with the ${acc.label} accent.`
        : acc.lang === "es"
        ? `Hola, soy Steven Turcott. Bienvenido a Builder Flow con el acento de ${acc.region}.`
        : acc.lang === "fr"
        ? `Bonjour, je suis Steven Turcott. Bienvenue sur Builder Flow avec l'accent ${acc.label}.`
        : `Welcome to Builder Flow. Testing ${acc.label}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = acc.speechLang || acc.id;
    utterance.rate = acc.rate || 1.0;
    utterance.pitch = acc.pitch || 1.0;

    utterance.onend = () => setPreviewingAccent(null);
    utterance.onerror = () => setPreviewingAccent(null);

    window.speechSynthesis.speak(utterance);
  };

  const rowClass = (active) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
      active
        ? "bg-amber-500/15 border border-amber-500/30 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
    }`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ||
          "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
        }
        title="190+ World Languages & Regional Accents"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold uppercase tracking-wider">{lang}</span>
        {activeAccent?.flag && (
          <span className="text-sm leading-none">{activeAccent.flag}</span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white max-w-lg p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Global Localization Engine</span>
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              190+ Languages & Regional Accents
            </DialogTitle>
            <p className="text-xs text-white/50">
              Select any of 190+ global languages or choose a regional accent for customized speech narration & pronunciation.
            </p>
          </DialogHeader>

          <div className="px-6 space-y-3">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-full overflow-x-auto">
              <button
                onClick={() => setMode("accents")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  mode === "accents"
                    ? "bg-amber-400 text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Regional Accents</span>
              </button>
              <button
                onClick={() => setMode("languages")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  mode === "languages"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>190+ Languages</span>
              </button>
              <button
                onClick={() => setMode("countries")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  mode === "countries"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span>Countries</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "accents"
                    ? "Search accents (e.g. American, British, Canadian, Mexican, Québécois)..."
                    : mode === "languages"
                    ? "Search 190+ languages (e.g. Spanish, Japanese, Arabic, Swahili)..."
                    : "Search countries by name or language..."
                }
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-400/30 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[50vh] overflow-y-auto px-6 pb-6 mt-3 space-y-1">
            {mode === "accents" ? (
              <div className="space-y-1.5">
                <div className="px-1 py-1 text-[11px] font-medium text-amber-300/80 flex items-center justify-between">
                  <span>Selected Accent: {activeAccent.label} ({activeAccent.region})</span>
                  <span>{filteredAccents.length} regional styles</span>
                </div>
                {filteredAccents.map((acc) => {
                  const isCurrent = accent === acc.id;
                  const isPreviewing = previewingAccent === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => pickAccent(acc)}
                      className={rowClass(isCurrent)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="text-xl leading-none w-7 text-center shrink-0">
                        {acc.flag}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {acc.label}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                            {acc.id}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 truncate">{acc.region}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => playAccentPreview(e, acc)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
                          isPreviewing
                            ? "bg-amber-400 text-black border-amber-300 animate-pulse"
                            : "text-white/60 hover:text-white bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                        title="Hear voice preview in this accent"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {isCurrent && (
                        <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : mode === "languages" ? (
              <div className="space-y-1">
                <div className="px-1 py-1 text-[11px] font-medium text-white/40 flex items-center justify-between">
                  <span>Total Supported: 190+ World Languages</span>
                  <span>{filteredLanguages.length} matching</span>
                </div>
                {filteredLanguages.map((l) => {
                  const isCurrent = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => pickLanguage(l.code)}
                      className={rowClass(isCurrent)}
                    >
                      <span className="text-xs font-mono font-bold text-white/50 uppercase w-8 shrink-0">
                        {l.code}
                      </span>
                      <span className="flex-1 text-sm truncate font-medium">{l.name}</span>
                      <span className="text-xs text-white/35 truncate max-w-[120px]">
                        {l.native}
                      </span>
                      {isCurrent && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCountries.map((c) => {
                  const isCurrent = lang === c.lang;
                  return (
                    <button
                      key={c.code}
                      onClick={() => pickLanguage(c.lang)}
                      className={rowClass(isCurrent)}
                    >
                      <span className="text-xl leading-none w-7 text-center shrink-0">
                        {flagFor(c.code)}
                      </span>
                      <span className="flex-1 text-sm truncate font-medium">{c.name}</span>
                      <span className="text-xs text-white/35 truncate max-w-[120px]">
                        {nativeLanguageName(c.lang)}
                      </span>
                      {isCurrent && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}