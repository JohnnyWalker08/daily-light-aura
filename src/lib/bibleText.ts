// Multi-translation chapter loading.
// Priority for every request: IndexedDB cache -> our own database (KJV seed)
// -> provider (bible-api.com for public domain, YouVersion proxy for licensed).
import { supabase } from "@/integrations/supabase/client";
import { getChapter, saveChapter } from "@/lib/offlineBible";
import { DEFAULT_TRANSLATION_ID, getTranslation, TRANSLATIONS } from "@/lib/translations";

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

async function fetchFromYouVersion(
  version: string,
  book: string,
  chapter: number,
  verse?: number
): Promise<ChapterData | null> {
  const res = await fetch(`${FUNCTIONS_BASE}/bible-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version, book, chapter, verse }),
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
      await saveChapter(book, chapter, row!.data, meta.id).catch(() => {});
      return row!.data as unknown as ChapterData;
    }
  }

  // 3. Provider
  const fetched =
    meta.provider === "youversion"
      ? await fetchFromYouVersion(meta.providerCode, book, chapter)
      : await fetchFromBibleApi(meta.providerCode, book, chapter);

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

  if (meta.provider === "youversion") {
    const data = await fetchFromYouVersion(meta.providerCode, book, chapter, verse);
    return data?.verses?.[0]?.text ?? null;
  }

  const chapterData = await loadChapterText(book, chapter, meta.id);
  return chapterData?.verses.find((v) => v.verse === verse)?.text ?? null;
}

// --- Availability of licensed versions --------------------------------------

const AVAILABILITY_KEY = "dailylight_available_versions";
const AVAILABILITY_TTL = 1000 * 60 * 60 * 24;

let availabilityPromise: Promise<Set<string>> | null = null;

/** Ids of translations that can actually be read right now. */
export async function getAvailableTranslationIds(): Promise<Set<string>> {
  const always = new Set(TRANSLATIONS.filter((t) => t.provider === "bible-api").map((t) => t.id));

  try {
    const raw = localStorage.getItem(AVAILABILITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.at < AVAILABILITY_TTL && Array.isArray(parsed.codes)) {
        return unionWithCodes(always, parsed.codes);
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
          body: JSON.stringify({ action: "versions" }),
        });
        if (!res.ok) return always;
        const data = await res.json();
        const codes: string[] = (data?.versions || []).map((v: any) => String(v.id));
        localStorage.setItem(AVAILABILITY_KEY, JSON.stringify({ at: Date.now(), codes }));
        return unionWithCodes(always, codes);
      } catch {
        return always;
      } finally {
        availabilityPromise = null;
      }
    })();
  }

  return availabilityPromise;
}

function unionWithCodes(base: Set<string>, codes: string[]) {
  const codeSet = new Set(codes.map(String));
  const result = new Set(base);
  for (const t of TRANSLATIONS) {
    if (t.provider === "youversion" && codeSet.has(t.providerCode)) result.add(t.id);
  }
  return result;
}
