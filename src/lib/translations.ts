// Central registry of Bible translations available in the app.
// Public-domain versions are served by the open bible-api.com endpoint.
// Licensed versions (NKJV, NLT, GNT, NIV, ESV, ...) are served through the
// YouVersion Platform proxy edge function, which holds the API key server-side.

export type TranslationProvider = "bible-api" | "youversion";

export interface TranslationMeta {
  id: string;              // internal id used in settings + cache keys
  abbrev: string;          // short label shown in the UI
  name: string;            // full name
  provider: TranslationProvider;
  providerCode: string;    // bible-api translation slug, or YouVersion version id
  licensed: boolean;       // requires the YouVersion key to be configured
  group: "Popular" | "Classic" | "Study";
  blurb: string;
}

export const TRANSLATIONS: TranslationMeta[] = [
  // --- Public domain, always available -------------------------------------
  {
    id: "kjv",
    abbrev: "KJV",
    name: "King James Version",
    provider: "bible-api",
    providerCode: "kjv",
    licensed: false,
    group: "Classic",
    blurb: "The classic 1611 text. Fully offline in this app.",
  },
  {
    id: "web",
    abbrev: "WEB",
    name: "World English Bible",
    provider: "bible-api",
    providerCode: "web",
    licensed: false,
    group: "Classic",
    blurb: "Modern English update of the ASV.",
  },
  {
    id: "asv",
    abbrev: "ASV",
    name: "American Standard Version",
    provider: "bible-api",
    providerCode: "asv",
    licensed: false,
    group: "Classic",
    blurb: "Literal 1901 translation, precise wording.",
  },
  {
    id: "ylt",
    abbrev: "YLT",
    name: "Young's Literal Translation",
    provider: "bible-api",
    providerCode: "ylt",
    licensed: false,
    group: "Study",
    blurb: "Extremely literal, word-for-word from the original.",
  },
  {
    id: "dby",
    abbrev: "DBY",
    name: "Darby Translation",
    provider: "bible-api",
    providerCode: "dby",
    licensed: false,
    group: "Study",
    blurb: "Careful scholarly rendering by J. N. Darby.",
  },
  {
    id: "bbe",
    abbrev: "BBE",
    name: "Bible in Basic English",
    provider: "bible-api",
    providerCode: "bbe",
    licensed: false,
    group: "Study",
    blurb: "Simple vocabulary — great for plain-language clarity.",
  },
  {
    id: "oeb-us",
    abbrev: "OEB",
    name: "Open English Bible",
    provider: "bible-api",
    providerCode: "oeb-us",
    licensed: false,
    group: "Study",
    blurb: "Contemporary open translation.",
  },

  // --- Licensed, via YouVersion Platform -----------------------------------
  {
    id: "nkjv",
    abbrev: "NKJV",
    name: "New King James Version",
    provider: "youversion",
    providerCode: "114",
    licensed: true,
    group: "Popular",
    blurb: "KJV beauty in modern, readable English.",
  },
  {
    id: "nlt",
    abbrev: "NLT",
    name: "New Living Translation",
    provider: "youversion",
    providerCode: "116",
    licensed: true,
    group: "Popular",
    blurb: "Warm, natural English — easy to read and feel.",
  },
  {
    id: "niv",
    abbrev: "NIV",
    name: "New International Version",
    provider: "youversion",
    providerCode: "111",
    licensed: true,
    group: "Popular",
    blurb: "The most widely read modern translation.",
  },
  {
    id: "esv",
    abbrev: "ESV",
    name: "English Standard Version",
    provider: "youversion",
    providerCode: "59",
    licensed: true,
    group: "Popular",
    blurb: "Word-for-word accuracy with modern readability.",
  },
  {
    id: "gnt",
    abbrev: "GNT",
    name: "Good News Translation",
    provider: "youversion",
    providerCode: "68",
    licensed: true,
    group: "Popular",
    blurb: "Clear, everyday language for all ages.",
  },
  {
    id: "msg",
    abbrev: "MSG",
    name: "The Message",
    provider: "youversion",
    providerCode: "97",
    licensed: true,
    group: "Popular",
    blurb: "Paraphrase in vivid contemporary idiom.",
  },
  {
    id: "amp",
    abbrev: "AMP",
    name: "Amplified Bible",
    provider: "youversion",
    providerCode: "1588",
    licensed: true,
    group: "Study",
    blurb: "Expands key words to unpack their full meaning.",
  },
  {
    id: "csb",
    abbrev: "CSB",
    name: "Christian Standard Bible",
    provider: "youversion",
    providerCode: "1713",
    licensed: true,
    group: "Popular",
    blurb: "Balance of accuracy and readability.",
  },
  {
    id: "nasb",
    abbrev: "NASB",
    name: "New American Standard Bible",
    provider: "youversion",
    providerCode: "2692",
    licensed: true,
    group: "Study",
    blurb: "One of the most literal modern translations.",
  },
];

export const DEFAULT_TRANSLATION_ID = "kjv";

export function getTranslation(id: string): TranslationMeta {
  return TRANSLATIONS.find((t) => t.id === id) || TRANSLATIONS[0];
}

export function translationLabel(id: string): string {
  return getTranslation(id).abbrev;
}

export const TRANSLATION_GROUPS: Array<TranslationMeta["group"]> = ["Popular", "Classic", "Study"];
