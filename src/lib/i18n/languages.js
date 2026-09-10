// Supported language codes (ISO 639 plus a few 639-2/3 codes).
// Display names are resolved in the browser via Intl.DisplayNames, so no
// hand-maintained name table is needed.
export const LANGUAGES = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av",
  "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo",
  "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv",
  "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es",
  "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga",
  "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr",
  "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik",
  "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj",
  "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw",
  "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
  "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my",
  "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv",
  "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps",
  "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd",
  "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr",
  "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti",
  "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug",
  "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi",
  "yo", "za", "zh", "zu",
  "fil", "haw", "ckb", "bho", "mai", "doi",
];

// Languages written right-to-left.
export const RTL_LANGS = ["ar", "he", "fa", "ur", "ps", "sd", "yi", "dv", "ku", "ckb", "ug"];

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
    const n = getEnNames()?.of(code);
    return n && n !== code ? n : code;
  } catch {
    return code;
  }
};

// Name of a language in the language itself, e.g. "Español". Falls back to the code.
export const nativeLanguageName = (code) => {
  if (!nativeCache[code]) {
    try {
      const n = new Intl.DisplayNames([code], { type: "language" }).of(code);
      nativeCache[code] = n && n !== code ? n : code;
    } catch {
      nativeCache[code] = code;
    }
  }
  return nativeCache[code];
};