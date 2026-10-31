import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { client } from "@/api/localClient";
import { STRINGS, STRINGS_VERSION } from "./strings";
import { RTL_LANGS, languageName, REGIONAL_ACCENTS, findAccent } from "./languages";

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
  const [accent, setAccentState] = useState(() => localStorage.getItem("bf_accent") || "en-US");
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
        const res = await client.functions.invoke("getTranslations", {
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
    const baseCode = code.split("-")[0];
    localStorage.setItem("bf_lang", baseCode);
    setLang(baseCode);

    // If an accent matches this code or has this base lang, sync accent
    const directAccent = findAccent(code);
    if (directAccent) {
      setAccentState(code);
      localStorage.setItem("bf_accent", code);
    } else {
      const defaultForLang = REGIONAL_ACCENTS.find((a) => a.lang === baseCode);
      if (defaultForLang) {
        setAccentState(defaultForLang.id);
        localStorage.setItem("bf_accent", defaultForLang.id);
      }
    }
  }, []);

  const setAccent = useCallback((accentId) => {
    const acc = findAccent(accentId);
    if (acc) {
      localStorage.setItem("bf_accent", accentId);
      setAccentState(accentId);
      localStorage.setItem("bf_lang", acc.lang);
      setLang(acc.lang);
    } else {
      localStorage.setItem("bf_accent", accentId);
      setAccentState(accentId);
    }
  }, []);

  const activeAccent = findAccent(accent) || {
    id: `${lang}-${lang.toUpperCase()}`,
    lang,
    flag: "🌐",
    region: languageName(lang),
    label: `${languageName(lang)} Standard`,
    speechLang: `${lang}-${lang.toUpperCase()}`,
    pitch: 1.0,
    rate: 1.0,
  };

  const t = useCallback(
    (key) => {
      const v = dict[key];
      if (typeof v === "string" && v) return v;
      return STRINGS[key] || key;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        accent,
        setAccent,
        activeAccent,
        regionalAccents: REGIONAL_ACCENTS,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  return {
    lang: "en",
    setLanguage: () => {},
    accent: "en-US",
    setAccent: () => {},
    activeAccent: {
      id: "en-US",
      lang: "en",
      flag: "🇺🇸",
      region: "United States",
      label: "American Standard",
      speechLang: "en-US",
      pitch: 0.95,
      rate: 1.0,
    },
    regionalAccents: REGIONAL_ACCENTS,
    t: (k) => STRINGS[k] || k,
  };
}