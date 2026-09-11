// Full 190+ World Languages (ISO 639-1 / 639-2 / 639-3)
// Supported globally with Intl.DisplayNames & speech synthesis
export const LANGUAGES = [
  // A
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
  // B
  "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "bho",
  // C
  "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "ckb",
  // D
  "da", "de", "dv", "dz", "doi",
  // E
  "ee", "el", "en", "eo", "es", "et", "eu",
  // F
  "fa", "ff", "fi", "fj", "fo", "fr", "fy", "fil",
  // G
  "ga", "gd", "gl", "gn", "gu", "gv",
  // H
  "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "haw",
  // I
  "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu",
  // J
  "ja", "jv",
  // K
  "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky",
  // L
  "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
  // M
  "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "mai",
  // N
  "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny",
  // O
  "oc", "oj", "om", "or", "os",
  // P
  "pa", "pi", "pl", "ps", "pt",
  // Q
  "qu",
  // R
  "rm", "rn", "ro", "ru", "rw",
  // S
  "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw",
  // T
  "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty",
  // U
  "ug", "uk", "ur", "uz",
  // V
  "ve", "vi", "vo",
  // W
  "wa", "wo",
  // X
  "xh",
  // Y
  "yi", "yo",
  // Z
  "za", "zh", "zu",
  // Additional world languages to ensure 190+ comprehensive coverage
  "ast", "ber", "ceb", "hmn", "hil", "ilo", "kab", "kri", "ltg", "lus",
  "min", "pag", "pam", "pap", "prs", "rom", "scn", "shn", "syr", "tet",
  "war", "zgh", "gsw", "szl", "tzm", "vec", "vls"
];

// Languages written right-to-left
export const RTL_LANGS = [
  "ar", "he", "fa", "ur", "ps", "sd", "yi", "dv", "ku", "ckb", "ug", "prs", "syr"
];

// Regional Accents & Dialects with locale tags, native labels, and speech synthesizer voice hints
export const REGIONAL_ACCENTS = [
  // English Accents
  { id: "en-US", lang: "en", flag: "🇺🇸", region: "United States", label: "American Standard", speechLang: "en-US", pitch: 0.95, rate: 1.0 },
  { id: "en-GB", lang: "en", flag: "🇬🇧", region: "United Kingdom", label: "British Received Pronunciation", speechLang: "en-GB", pitch: 1.0, rate: 0.98 },
  { id: "en-CA", lang: "en", flag: "🇨🇦", region: "Canada", label: "Canadian English", speechLang: "en-CA", pitch: 0.96, rate: 1.0 },
  { id: "en-AU", lang: "en", flag: "🇦🇺", region: "Australia", label: "Australian English", speechLang: "en-AU", pitch: 1.02, rate: 1.02 },
  { id: "en-IE", lang: "en", flag: "🇮🇪", region: "Ireland", label: "Irish Hiberno-English", speechLang: "en-IE", pitch: 1.05, rate: 1.0 },
  { id: "en-IN", lang: "en", flag: "🇮🇳", region: "India", label: "Indian English", speechLang: "en-IN", pitch: 1.05, rate: 1.04 },
  { id: "en-ZA", lang: "en", flag: "🇿🇦", region: "South Africa", label: "South African English", speechLang: "en-ZA", pitch: 0.98, rate: 0.98 },
  { id: "en-NZ", lang: "en", flag: "🇳🇿", region: "New Zealand", label: "New Zealand Kiwi", speechLang: "en-NZ", pitch: 1.02, rate: 1.0 },
  { id: "en-JM", lang: "en", flag: "🇯🇲", region: "Caribbean / Jamaica", label: "Caribbean Jamaican English", speechLang: "en-JM", pitch: 1.04, rate: 1.0 },
  { id: "en-SG", lang: "en", flag: "🇸🇬", region: "Singapore", label: "Singaporean English", speechLang: "en-SG", pitch: 1.03, rate: 1.05 },

  // Spanish Accents
  { id: "es-ES", lang: "es", flag: "🇪🇸", region: "Spain", label: "Castilian Spanish (Peninsular)", speechLang: "es-ES", pitch: 1.0, rate: 1.0 },
  { id: "es-MX", lang: "es", flag: "🇲🇽", region: "Mexico", label: "Mexican Spanish", speechLang: "es-MX", pitch: 0.98, rate: 1.0 },
  { id: "es-AR", lang: "es", flag: "🇦🇷", region: "Argentina", label: "Rioplatense Argentine", speechLang: "es-AR", pitch: 1.05, rate: 1.02 },
  { id: "es-CO", lang: "es", flag: "🇨🇴", region: "Colombia", label: "Colombian Bogotano", speechLang: "es-CO", pitch: 0.98, rate: 0.98 },
  { id: "es-CL", lang: "es", flag: "🇨🇱", region: "Chile", label: "Chilean Spanish", speechLang: "es-CL", pitch: 1.02, rate: 1.05 },
  { id: "es-PE", lang: "es", flag: "🇵🇪", region: "Peru", label: "Peruvian Coastal Spanish", speechLang: "es-PE", pitch: 0.98, rate: 0.98 },
  { id: "es-US", lang: "es", flag: "🇺🇸", region: "United States", label: "US Hispanic Spanish", speechLang: "es-US", pitch: 0.97, rate: 1.0 },

  // French Accents
  { id: "fr-FR", lang: "fr", flag: "🇫🇷", region: "France", label: "Standard Parisian French", speechLang: "fr-FR", pitch: 1.0, rate: 1.0 },
  { id: "fr-CA", lang: "fr", flag: "🇨🇦", region: "Canada / Quebec", label: "Québécois Canadian French", speechLang: "fr-CA", pitch: 0.97, rate: 0.98 },
  { id: "fr-BE", lang: "fr", flag: "🇧🇪", region: "Belgium", label: "Belgian Walloon French", speechLang: "fr-BE", pitch: 1.0, rate: 0.98 },
  { id: "fr-CH", lang: "fr", flag: "🇨🇭", region: "Switzerland", label: "Swiss Romand French", speechLang: "fr-CH", pitch: 0.98, rate: 0.96 },
  { id: "fr-SN", lang: "fr", flag: "🇸🇳", region: "West Africa", label: "West African French", speechLang: "fr-SN", pitch: 1.02, rate: 1.02 },

  // Portuguese Accents
  { id: "pt-BR", lang: "pt", flag: "🇧🇷", region: "Brazil", label: "Brazilian Portuguese (Paulistano)", speechLang: "pt-BR", pitch: 1.02, rate: 1.02 },
  { id: "pt-PT", lang: "pt", flag: "🇵🇹", region: "Portugal", label: "European Portuguese (Lisbon)", speechLang: "pt-PT", pitch: 0.96, rate: 0.98 },
  { id: "pt-AO", lang: "pt", flag: "🇦🇴", region: "Angola", label: "Angolan Portuguese", speechLang: "pt-AO", pitch: 0.98, rate: 1.0 },

  // German Accents
  { id: "de-DE", lang: "de", flag: "🇩🇪", region: "Germany", label: "Standard German (Hochdeutsch)", speechLang: "de-DE", pitch: 0.98, rate: 1.0 },
  { id: "de-AT", lang: "de", flag: "🇦🇹", region: "Austria", label: "Austrian German (Wienerisch)", speechLang: "de-AT", pitch: 1.02, rate: 0.98 },
  { id: "de-CH", lang: "de", flag: "🇨🇭", region: "Switzerland", label: "Swiss German (Schwiizerdütsch)", speechLang: "de-CH", pitch: 1.04, rate: 0.96 },

  // Arabic Dialects
  { id: "ar-SA", lang: "ar", flag: "🇸🇦", region: "Saudi Arabia", label: "Modern Standard Arabic (Fusha)", speechLang: "ar-SA", pitch: 0.96, rate: 0.96 },
  { id: "ar-EG", lang: "ar", flag: "🇪🇬", region: "Egypt", label: "Egyptian Dialect (Masri)", speechLang: "ar-EG", pitch: 1.02, rate: 1.0 },
  { id: "ar-AE", lang: "ar", flag: "🇦🇪", region: "UAE & Gulf", label: "Gulf Dialect (Khaliji)", speechLang: "ar-AE", pitch: 0.98, rate: 0.98 },
  { id: "ar-MA", lang: "ar", flag: "🇲🇦", region: "Morocco / Maghreb", label: "Maghrebi Darija", speechLang: "ar-MA", pitch: 1.0, rate: 1.02 },
  { id: "ar-LB", lang: "ar", flag: "🇱🇧", region: "Lebanon / Levant", label: "Levantine Shami", speechLang: "ar-LB", pitch: 1.02, rate: 1.0 },

  // Chinese Accents
  { id: "zh-CN", lang: "zh", flag: "🇨🇳", region: "China", label: "Mandarin Simplified (Putonghua)", speechLang: "zh-CN", pitch: 1.0, rate: 1.0 },
  { id: "zh-TW", lang: "zh", flag: "🇹🇼", region: "Taiwan", label: "Traditional Taiwanese Mandarin", speechLang: "zh-TW", pitch: 1.02, rate: 0.98 },
  { id: "zh-HK", lang: "zh", flag: "🇭🇰", region: "Hong Kong", label: "Cantonese (Yue)", speechLang: "zh-HK", pitch: 1.04, rate: 1.02 },

  // Italian Accents
  { id: "it-IT", lang: "it", flag: "🇮🇹", region: "Italy", label: "Standard Italian (Florentine)", speechLang: "it-IT", pitch: 1.0, rate: 1.0 },
  { id: "it-CH", lang: "it", flag: "🇨🇭", region: "Switzerland", label: "Swiss Italian (Ticinese)", speechLang: "it-CH", pitch: 0.98, rate: 0.98 },

  // Japanese
  { id: "ja-JP", lang: "ja", flag: "🇯🇵", region: "Japan", label: "Standard Japanese (Tokyo)", speechLang: "ja-JP", pitch: 1.0, rate: 1.0 },

  // Hindi & South Asian Accents
  { id: "hi-IN", lang: "hi", flag: "🇮🇳", region: "India", label: "Standard Hindi (Khariboli)", speechLang: "hi-IN", pitch: 1.0, rate: 1.0 },
  { id: "bn-BD", lang: "bn", flag: "🇧🇩", region: "Bangladesh", label: "Bangla / Bengali", speechLang: "bn-BD", pitch: 1.0, rate: 1.0 },

  // Dutch
  { id: "nl-NL", lang: "nl", flag: "🇳🇱", region: "Netherlands", label: "Standard Dutch (Algemeen)", speechLang: "nl-NL", pitch: 0.98, rate: 1.0 },
  { id: "nl-BE", lang: "nl", flag: "🇧🇪", region: "Belgium", label: "Flemish Dutch (Vlaams)", speechLang: "nl-BE", pitch: 1.0, rate: 0.98 },

  // Russian & Slavic
  { id: "ru-RU", lang: "ru", flag: "🇷🇺", region: "Russia", label: "Standard Russian", speechLang: "ru-RU", pitch: 0.96, rate: 0.98 },
  { id: "pl-PL", lang: "pl", flag: "🇵🇱", region: "Poland", label: "Standard Polish", speechLang: "pl-PL", pitch: 0.98, rate: 1.0 },

  // Korean
  { id: "ko-KR", lang: "ko", flag: "🇰🇷", region: "South Korea", label: "Standard Korean (Seoul)", speechLang: "ko-KR", pitch: 1.0, rate: 1.0 }
];

let enNames = null;
const nativeCache = {};

const getEnNames = () => {
  if (!enNames) {
    try {
      enNames = new Intl.DisplayNames(["en"], { type: "language" });
    } catch {
      enNames = null;
    }
  }
  return enNames;
};

// English name of a language, e.g. "Spanish". Falls back to the code.
export const languageName = (code) => {
  try {
    const clean = code.split("-")[0];
    const n = getEnNames()?.of(clean);
    return n && n !== clean ? n : code;
  } catch {
    return code;
  }
};

// Name of a language in the language itself, e.g. "Español". Falls back to the code.
export const nativeLanguageName = (code) => {
  const clean = code.split("-")[0];
  if (!nativeCache[clean]) {
    try {
      const n = new Intl.DisplayNames([clean], { type: "language" }).of(clean);
      nativeCache[clean] = n && n !== clean ? n : clean;
    } catch {
      nativeCache[clean] = clean;
    }
  }
  return nativeCache[clean];
};

export const findAccent = (accentId) => {
  return REGIONAL_ACCENTS.find((a) => a.id === accentId) || null;
};