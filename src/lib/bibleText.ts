// Multi-translation chapter loading.
// Priority for every request: IndexedDB cache -> our own database (KJV seed)
// -> the reader's own publisher key (ESV / NLT / API.Bible) -> shared
// YouVersion proxy -> bible-api.com for public domain texts.
import { supabase } from "@/integrations/supabase/client";
import { getChapter, saveChapter } from "@/lib/offlineBible";
import { getApiBibleIds, getProviderKeys } from "@/lib/licenseKeys";
import {
  DEFAULT_TRANSLATION_ID,
  getTranslation,
  keyUnlockedTranslationIds,
  resolveSource,
  TRANSLATIONS,
} from "@/lib/translations";

export interface ChapterVerse {
  verse: number;
  text: string;
}

export interface ChapterData {
  reference: string;
  verses: ChapterVerse[];
  translation?: string;
}

export function isValidChapterData(data: any): data is ChapterData {
  return Boolean(
    data?.reference &&
      Array.isArray(data?.verses) &&
      data.verses.length > 0 &&
      data.verses.every((v: any) => typeof v?.verse === "number" && typeof v?.text === "string")
  );
}

const FUNCTIONS_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

async function fetchFromProxy(
  provider: string,
  version: string,
  book: string,
  chapter: number,
  verse?: number
): Promise<ChapterData | null> {
  const res = await fetch(`${FUNCTIONS_BASE}/bible-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, version, book, chapter, verse, keys: getProviderKeys() }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return isValidChapterData(data) ? data : null;
}

async function fetchFromBibleApi(code: string, book: string, chapter: number): Promise<ChapterData | null> {
  const res = await fetch(
    `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${code}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return isValidChapterData(data) ? data : null;
}

/** Load a chapter in a specific translation, offline-first. */
export async function loadChapterText(
  book: string,
  chapter: number,
  translationId: string = DEFAULT_TRANSLATION_ID
): Promise<ChapterData | null> {
  const meta = getTranslation(translationId);

  // 1. IndexedDB (per translation)
  const cached = await getChapter(book, chapter, meta.id).catch(() => null);
  if (isValidChapterData(cached)) return cached;

  // 2. Our seeded database (KJV only today)
  if (meta.id === "kjv") {
    const { data: row } = await supabase
      .from("bible_chapters")
      .select("data")
      .eq("book", book)
      .eq("chapter", chapter)
      .maybeSingle();
    if (isValidChapterData(row?.data)) {
      await saveChapter(book, chapter, row.data, meta.id).catch(() => {});
      return row.data as unknown as ChapterData;
    }
  }

  // 3. Provider (reader's own key first, then shared proxy / open API)
  const source = resolveSource(meta.id, getProviderKeys(), getApiBibleIds());
  let fetched: ChapterData | null = null;
  if (source?.kind === "proxy") {
    fetched = await fetchFromProxy(source.provider, source.code, book, chapter);
    if (!fetched && meta.provider === "bible-api") {
      fetched = await fetchFromBibleApi(meta.providerCode, book, chapter);
    }
  } else if (source?.kind === "bible-api") {
    fetched = await fetchFromBibleApi(source.code, book, chapter);
  }

  if (fetched) {
    await saveChapter(book, chapter, fetched, meta.id).catch(() => {});
    return fetched;
  }

  return null;
}

/** Load a single verse in a translation — used by the per-verse compare peek. */
export async function loadVerseText(
  book: string,
  chapter: number,
  verse: number,
  translationId: string
): Promise<string | null> {
  const meta = getTranslation(translationId);

  const cached = await getChapter(book, chapter, meta.id).catch(() => null);
  if (isValidChapterData(cached)) {
    const hit = cached.verses.find((v) => v.verse === verse);
    if (hit) return hit.text;
  }

  const source = resolveSource(meta.id, getProviderKeys(), getApiBibleIds());
  if (source?.kind === "proxy") {
    const data = await fetchFromProxy(source.provider, source.code, book, chapter, verse);
    const hit = data?.verses?.find((v) => v.verse === verse) ?? data?.verses?.[0];
    if (hit) return hit.text;
  }

  const chapterData = await loadChapterText(book, chapter, meta.id);
  return chapterData?.verses.find((v) => v.verse === verse)?.text ?? null;
}

// --- Availability of licensed versions --------------------------------------

const AVAILABILITY_KEY = "dailylight_available_versions";
const AVAILABILITY_TTL = 1000 * 60 * 60 * 24;

export interface TranslationAvailability {
  ids: Set<string>;
  status: "checking" | "verified" | "unreachable";
}

let availabilityPromise: Promise<TranslationAvailability> | null = null;

export function clearAvailabilityCache() {
  localStorage.removeItem(AVAILABILITY_KEY);
  availabilityPromise = null;
}

/** Availability without mistaking a temporary provider outage for a licence denial. */
export async function getTranslationAvailability(): Promise<TranslationAvailability> {
  const always = new Set(TRANSLATIONS.filter((t) => t.provider === "bible-api").map((t) => t.id));
  for (const id of keyUnlockedTranslationIds(getProviderKeys(), getApiBibleIds())) always.add(id);
  const permissive = new Set(TRANSLATIONS.map((translation) => translation.id));

  try {
    const raw = localStorage.getItem(AVAILABILITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.at < AVAILABILITY_TTL && Array.isArray(parsed.codes)) {
        return { ids: unionWithCodes(always, parsed.codes), status: "verified" };
      }
    }
  } catch {
    // ignore malformed cache
  }

  if (!availabilityPromise) {
    availabilityPromise = (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_BASE}/bible-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "versions", keys: getProviderKeys() }),
        });
        if (!res.ok) return { ids: permissive, status: "unreachable" } as TranslationAvailability;
        const data = await res.json();
        if (!Array.isArray(data?.versions)) {
          return { ids: permissive, status: "unreachable" } as TranslationAvailability;
        }
        const codes: string[] = (data?.versions || []).map((v: any) => String(v.id));
        localStorage.setItem(AVAILABILITY_KEY, JSON.stringify({ at: Date.now(), codes }));
        return { ids: unionWithCodes(always, codes), status: "verified" } as TranslationAvailability;
      } catch {
        return { ids: permissive, status: "unreachable" } as TranslationAvailability;
      } finally {
        availabilityPromise = null;
      }
    })();
  }

  return availabilityPromise;
}

/** Ids to present in reader features. Outages remain permissive so controls never disappear. */
export async function getAvailableTranslationIds(): Promise<Set<string>> {
  return (await getTranslationAvailability()).ids;
}

function unionWithCodes(base: Set<string>, codes: string[]) {
  const codeSet = new Set(codes.map(String));
  const result = new Set(base);
  for (const t of TRANSLATIONS) {
    if (t.provider === "youversion" && codeSet.has(t.providerCode)) result.add(t.id);
  }
  return result;
}
