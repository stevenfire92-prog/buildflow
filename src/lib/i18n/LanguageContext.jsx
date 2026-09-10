import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { STRINGS, STRINGS_VERSION } from "./strings";
import { RTL_LANGS, languageName } from "./languages";

const LanguageContext = createContext(null);

const readCache = (code) => {
  try {
    const raw = localStorage.getItem("bf_dict_" + code);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v !== STRINGS_VERSION || !parsed?.t) return null;
    return parsed.t;
  } catch {
    return null;
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("bf_lang") || "en");
  const [dict, setDict] = useState({});

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

    if (lang === "en") {
      setDict({});
      return;
    }
    const cached = readCache(lang);
    if (cached) {
      setDict(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("getTranslations", {
          run_key: "bf-translations-7c4f",
          language_code: lang,
          language_name: languageName(lang),
          strings: STRINGS,
        });
        const data = res?.data ?? res;
        const translations = data?.translations || {};
        if (!cancelled) {
          setDict(translations);
          try {
            localStorage.setItem(
              "bf_dict_" + lang,
              JSON.stringify({ v: STRINGS_VERSION, t: translations })
            );
          } catch {
            /* storage full — translations still work for this session */
          }
        }
      } catch {
        if (!cancelled) setDict({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLanguage = useCallback((code) => {
    localStorage.setItem("bf_lang", code);
    setLang(code);
  }, []);

  const t = useCallback(
    (key) => {
      const v = dict[key];
      if (typeof v === "string" && v) return v;
      return STRINGS[key] || key;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Graceful fallback if used outside the provider
  return { lang: "en", setLanguage: () => {}, t: (k) => STRINGS[k] || k };
}