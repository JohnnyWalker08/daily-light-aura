// Central registry of Bible translations available in the app.
// Public-domain versions come from the open bible-api.com endpoint (and are
// seeded/offline for KJV). Licensed versions are served through the
// `bible-text` edge function, which holds the YouVersion Platform key
// server-side. Availability of licensed versions depends on publisher
// approval on the YouVersion developer account, so it is checked at runtime.

export type TranslationProvider = "bible-api" | "youversion";

export interface TranslationMeta {
  id: string;
  abbrev: string;
  name: string;
  provider: TranslationProvider;
  providerCode: string;
  group: "Popular" | "Classic" | "Easy reading" | "Study";
  blurb: string;
  /** Direct publisher API that serves this version when the reader connects their own key. */
  direct?: "esv" | "nlt";
}

import type { ProviderKeys } from "@/lib/licenseKeys";

export const TRANSLATIONS: TranslationMeta[] = [
  // --- Popular modern ------------------------------------------------------
  { id: "niv", abbrev: "NIV", name: "New International Version", provider: "youversion", providerCode: "111", group: "Popular", blurb: "The most widely read modern translation." },
  { id: "nivuk", abbrev: "NIVUK", name: "New International Version (Anglicised)", provider: "youversion", providerCode: "113", group: "Popular", blurb: "NIV in British English." },
  { id: "nkjv", abbrev: "NKJV", name: "New King James Version", provider: "youversion", providerCode: "114", group: "Popular", blurb: "KJV beauty in modern, readable English." },
  { id: "nlt", abbrev: "NLT", name: "New Living Translation", provider: "youversion", providerCode: "116", group: "Popular", blurb: "Warm, natural English — easy to read and feel.", direct: "nlt" },
  { id: "esv", abbrev: "ESV", name: "English Standard Version", provider: "youversion", providerCode: "59", group: "Popular", blurb: "Word-for-word accuracy, modern readability.", direct: "esv" },
  { id: "gnt", abbrev: "GNT", name: "Good News Translation", provider: "youversion", providerCode: "68", group: "Popular", blurb: "Clear, everyday language for all ages." },
  { id: "csb", abbrev: "CSB", name: "Christian Standard Bible", provider: "youversion", providerCode: "1713", group: "Popular", blurb: "Balance of accuracy and readability." },
  { id: "msg", abbrev: "MSG", name: "The Message", provider: "youversion", providerCode: "97", group: "Popular", blurb: "Paraphrase in vivid contemporary idiom." },
  { id: "bsb", abbrev: "BSB", name: "Berean Standard Bible", provider: "youversion", providerCode: "3034", group: "Popular", blurb: "Clear modern translation, freely available." },

  // --- Classic -------------------------------------------------------------
  { id: "kjv", abbrev: "KJV", name: "King James Version", provider: "bible-api", providerCode: "kjv", group: "Classic", blurb: "The classic 1611 text. Fully offline in this app." },
  { id: "asv", abbrev: "ASV", name: "American Standard Version", provider: "bible-api", providerCode: "asv", group: "Classic", blurb: "Literal 1901 translation, precise wording." },
  { id: "web", abbrev: "WEB", name: "World English Bible", provider: "bible-api", providerCode: "web", group: "Classic", blurb: "Modern English update of the ASV." },
  { id: "gnv", abbrev: "GNV", name: "Geneva Bible", provider: "youversion", providerCode: "2163", group: "Classic", blurb: "The 1599 Bible of the Reformation." },
  { id: "dby", abbrev: "DBY", name: "Darby Translation", provider: "bible-api", providerCode: "dby", group: "Classic", blurb: "Careful scholarly rendering by J. N. Darby." },

  // --- Easy reading --------------------------------------------------------
  { id: "nirv", abbrev: "NIrV", name: "New International Reader's Version", provider: "youversion", providerCode: "110", group: "Easy reading", blurb: "NIV simplified — great for new readers." },
  { id: "easy", abbrev: "EASY", name: "EasyEnglish Bible", provider: "youversion", providerCode: "2079", group: "Easy reading", blurb: "Very simple English, gently explained." },
  { id: "pev", abbrev: "PEV", name: "Plain English Version", provider: "youversion", providerCode: "2530", group: "Easy reading", blurb: "Straightforward, everyday wording." },
  { id: "bbe", abbrev: "BBE", name: "Bible in Basic English", provider: "bible-api", providerCode: "bbe", group: "Easy reading", blurb: "Limited vocabulary for maximum clarity." },
  { id: "tpt", abbrev: "TPT", name: "The Passion Translation", provider: "youversion", providerCode: "1849", group: "Easy reading", blurb: "Devotional, heart-language paraphrase." },

  // --- Study ---------------------------------------------------------------
  { id: "amp", abbrev: "AMP", name: "Amplified Bible", provider: "youversion", providerCode: "1588", group: "Study", blurb: "Expands key words to unpack their full meaning." },
  { id: "nasb", abbrev: "NASB", name: "New American Standard Bible (2020)", provider: "youversion", providerCode: "2692", group: "Study", blurb: "One of the most literal modern translations." },
  { id: "nasb1995", abbrev: "NASB95", name: "New American Standard Bible (1995)", provider: "youversion", providerCode: "100", group: "Study", blurb: "The classic NASB edition." },
  { id: "lsv", abbrev: "LSV", name: "Literal Standard Version", provider: "youversion", providerCode: "2660", group: "Study", blurb: "Highly literal, consistent word choices." },
  { id: "ylt", abbrev: "YLT", name: "Young's Literal Translation", provider: "bible-api", providerCode: "ylt", group: "Study", blurb: "Extremely literal, word-for-word." },
  { id: "fbv", abbrev: "FBV", name: "Free Bible Version", provider: "youversion", providerCode: "1932", group: "Study", blurb: "Translated from the original languages, freely shared." },
];

export const DEFAULT_TRANSLATION_ID = "kjv";

export const TRANSLATION_GROUPS: Array<TranslationMeta["group"]> = [
  "Popular",
  "Classic",
  "Easy reading",
  "Study",
];

export function getTranslation(id: string): TranslationMeta {
  return TRANSLATIONS.find((t) => t.id === id) || TRANSLATIONS.find((t) => t.id === DEFAULT_TRANSLATION_ID)!;
}

export function translationLabel(id: string): string {
  return getTranslation(id).abbrev;
}

// --- Source resolution -------------------------------------------------------
// Given the reader's connected keys, decide which backend actually serves a
// version right now: their own publisher key first, then API.Bible (if they
// pasted a Bible id for it), then the shared YouVersion proxy, then the open
// bible-api.com endpoint for public-domain texts.

export type ResolvedSource =
  | { kind: "bible-api"; code: string }
  | { kind: "proxy"; provider: "youversion" | "esv" | "nlt" | "apibible"; code: string };

export function resolveSource(
  id: string,
  keys: ProviderKeys,
  apiBibleIds: Record<string, string> = {}
): ResolvedSource | null {
  const meta = getTranslation(id);

  if (meta.direct && keys[meta.direct]) return { kind: "proxy", provider: meta.direct, code: meta.abbrev };
  if (keys.apibible && apiBibleIds[meta.id]) {
    return { kind: "proxy", provider: "apibible", code: apiBibleIds[meta.id] };
  }
  if (meta.provider === "bible-api") return { kind: "bible-api", code: meta.providerCode };
  return { kind: "proxy", provider: "youversion", code: meta.providerCode };
}

/** Versions the reader has personally unlocked with their own keys. */
export function keyUnlockedTranslationIds(
  keys: ProviderKeys,
  apiBibleIds: Record<string, string> = {}
): Set<string> {
  const ids = new Set<string>();
  for (const t of TRANSLATIONS) {
    if (t.direct && keys[t.direct]) ids.add(t.id);
    if (keys.apibible && apiBibleIds[t.id]) ids.add(t.id);
  }
  return ids;
}
