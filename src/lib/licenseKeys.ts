// Personal publisher/API keys the reader connects so licensed translations
// (NKJV, NLT, ESV, Good News, …) unlock instantly. Keys stay on this device
// (localStorage) and are only forwarded to our own `bible-text` proxy, which
// uses them for the single request and never stores them.

export type KeyProvider = "youversion" | "esv" | "nlt" | "apibible";

export interface ProviderMeta {
  id: KeyProvider;
  name: string;
  unlocks: string;
  help: string;
  signupUrl: string;
  placeholder: string;
}

export const KEY_PROVIDERS: ProviderMeta[] = [
  {
    id: "youversion",
    name: "YouVersion Platform",
    unlocks: "NIV, NKJV, NLT, ESV, GNT, MSG, AMP, NASB and more",
    help: "One key, many publishers. Each version still needs publisher approval on your developer account.",
    signupUrl: "https://developers.youversion.com/",
    placeholder: "YouVersion app key",
  },
  {
    id: "esv",
    name: "Crossway ESV API",
    unlocks: "ESV",
    help: "Free for personal and non-commercial use. Create an API token on Crossway's developer portal.",
    signupUrl: "https://api.esv.org/",
    placeholder: "ESV API token",
  },
  {
    id: "nlt",
    name: "Tyndale NLT API",
    unlocks: "NLT",
    help: "Request a free NLT API key from Tyndale House Publishers.",
    signupUrl: "https://api.nlt.to/",
    placeholder: "NLT API key",
  },
  {
    id: "apibible",
    name: "API.Bible (ABS)",
    unlocks: "Good News, NASB, ASV and hundreds more",
    help: "Free developer key from American Bible Society. Paste a Bible ID per version after connecting.",
    signupUrl: "https://scripture.api.bible/",
    placeholder: "API.Bible key",
  },
];

const KEYS_STORAGE = "dailylight_provider_keys";
const BIBLE_IDS_STORAGE = "dailylight_apibible_ids";
const EVENT = "dailylight-keys-change";

export type ProviderKeys = Partial<Record<KeyProvider, string>>;

export function getProviderKeys(): ProviderKeys {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    return raw ? (JSON.parse(raw) as ProviderKeys) : {};
  } catch {
    return {};
  }
}

export function setProviderKey(provider: KeyProvider, key: string | null) {
  const keys = getProviderKeys();
  if (key && key.trim()) keys[provider] = key.trim();
  else delete keys[provider];
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
  window.dispatchEvent(new Event(EVENT));
}

export function hasProviderKey(provider: KeyProvider) {
  return Boolean(getProviderKeys()[provider]);
}

/** Per-translation API.Bible ids the reader pastes (e.g. GNT -> bible id). */
export function getApiBibleIds(): Record<string, string> {
  try {
    const raw = localStorage.getItem(BIBLE_IDS_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setApiBibleId(translationId: string, bibleId: string | null) {
  const ids = getApiBibleIds();
  if (bibleId && bibleId.trim()) ids[translationId] = bibleId.trim();
  else delete ids[translationId];
  localStorage.setItem(BIBLE_IDS_STORAGE, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function onKeysChange(handler: () => void) {
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

const FUNCTIONS_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

export interface ValidationResult {
  ok: boolean;
  status?: number;
  versions?: string[];
  bibles?: Array<{ id: string; abbrev: string; title: string; language?: string }>;
}

export async function validateProviderKey(provider: KeyProvider, key: string): Promise<ValidationResult> {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/bible-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate", provider, key }),
    });
    if (!res.ok) return { ok: false, status: res.status };
    return (await res.json()) as ValidationResult;
  } catch {
    return { ok: false };
  }
}
