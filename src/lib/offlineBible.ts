// Offline Bible storage using IndexedDB
import { supabase } from "@/integrations/supabase/client";

const DB_NAME = 'BibleDB';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

// Chapter counts for each book
const BOOK_CHAPTERS: { [key: string]: number } = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14,
  "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3,
  "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
  "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
  "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, "Jude": 1, "Revelation": 22
};

const isValidChapterData = (data: any) =>
  Boolean(
    data?.reference &&
      Array.isArray(data?.verses) &&
      data.verses.length > 0 &&
      data.verses.every((verse: any) => typeof verse?.verse === "number" && typeof verse?.text === "string")
  );

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/** KJV keeps the legacy key shape so existing offline downloads keep working. */
function chapterKey(book: string, chapter: number, translation = "kjv") {
  return translation === "kjv" ? `${book}_${chapter}` : `${book}_${chapter}@${translation}`;
}

export async function saveChapter(book: string, chapter: number, data: any, translation = "kjv") {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = chapterKey(book, chapter, translation);

    const request = store.put({ key, data });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getChapter(book: string, chapter: number, translation = "kjv"): Promise<any | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = chapterKey(book, chapter, translation);

    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}


export async function isOfflineDataAvailable(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function downloadAllBible(
  onProgress?: (current: number, total: number) => void
) {
  const books = Object.keys(BOOK_CHAPTERS);
  let totalChapters = 0;
  Object.values(BOOK_CHAPTERS).forEach((count) => (totalChapters += count));

  const db = await openDB();

  const getFromDb = (key: string) =>
    new Promise<any | null>((resolve) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });

  const saveToDb = (key: string, data: any) =>
    new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ key, data });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

  let completed = 0;
  const failures: { book: string; chapter: number }[] = [];

  for (const book of books) {
    const chapters = BOOK_CHAPTERS[book];

    // Fetch all chapters for this book from our database in one query
    const { data: dbChapters } = await supabase
      .from("bible_chapters")
      .select("chapter, data")
      .eq("book", book);

    const dbMap = new Map<number, any>();
    (dbChapters || []).forEach((row: any) => dbMap.set(row.chapter, row.data));

    for (let ch = 1; ch <= chapters; ch++) {
      const key = `${book}_${ch}`;

      try {
        // Skip if already in IndexedDB
        const existing = await getFromDb(key);
        if (existing) {
          completed++;
          onProgress?.(completed, totalChapters);
          continue;
        }

        // Use database data
        const dbData = dbMap.get(ch);
        if (isValidChapterData(dbData)) {
          await saveToDb(key, dbData);
        } else {
          // Fallback to API if not in DB yet
          const url = `https://bible-api.com/${encodeURIComponent(book)}+${ch}?translation=kjv`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`Bible API returned ${response.status}`);
          const data = await response.json();
          if (!isValidChapterData(data)) throw new Error("Bible API returned incomplete chapter data");
          await saveToDb(key, data);
        }
      } catch (error) {
        failures.push({ book, chapter: ch });
      } finally {
        completed++;
        onProgress?.(completed, totalChapters);
      }
    }
  }

  if (failures.length > 0) {
    console.warn(`Offline download finished with ${failures.length} failures`, failures.slice(0, 5));
    throw new Error(`Offline download incomplete: ${failures.length} chapters failed`);
  }
}

export async function clearOfflineData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export { BOOK_CHAPTERS };

// --- Per-translation offline packs ------------------------------------------
// Readers choose which versions (and how much of the Bible) to keep on device.

export type PackScope = "whole" | "nt" | "gospels" | "psalms";

const NT_BOOKS = [
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];

export const PACK_SCOPES: { id: PackScope; label: string; description: string }[] = [
  { id: "whole", label: "Whole Bible", description: "All 66 books · 1,189 chapters" },
  { id: "nt", label: "New Testament", description: "Matthew – Revelation · 260 chapters" },
  { id: "gospels", label: "Gospels + Acts", description: "Matthew – Acts · 117 chapters" },
  { id: "psalms", label: "Psalms & Proverbs", description: "Daily devotional core · 181 chapters" },
];

export function booksForScope(scope: PackScope): string[] {
  switch (scope) {
    case "nt":
      return NT_BOOKS;
    case "gospels":
      return ["Matthew", "Mark", "Luke", "John", "Acts"];
    case "psalms":
      return ["Psalms", "Proverbs"];
    default:
      return Object.keys(BOOK_CHAPTERS);
  }
}

export function chapterCountForScope(scope: PackScope): number {
  return booksForScope(scope).reduce((sum, book) => sum + (BOOK_CHAPTERS[book] || 0), 0);
}

function allKeys(): Promise<string[]> {
  return openDB().then(
    (db) =>
      new Promise<string[]>((resolve) => {
        const tx = db.transaction([STORE_NAME], "readonly");
        const req = tx.objectStore(STORE_NAME).getAllKeys();
        req.onsuccess = () => resolve((req.result as string[]).map(String));
        req.onerror = () => resolve([]);
      })
  );
}

/** How many chapters are cached per translation id. */
export async function getPackStats(): Promise<Record<string, number>> {
  const keys = await allKeys();
  const stats: Record<string, number> = {};
  for (const key of keys) {
    const at = key.lastIndexOf("@");
    const translation = at > -1 ? key.slice(at + 1) : "kjv";
    stats[translation] = (stats[translation] || 0) + 1;
  }
  return stats;
}

export async function deletePack(translation: string) {
  const db = await openDB();
  const keys = await allKeys();
  const targets = keys.filter((key) => {
    const at = key.lastIndexOf("@");
    return (at > -1 ? key.slice(at + 1) : "kjv") === translation;
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    targets.forEach((key) => store.delete(key));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Download a translation pack. Uses the shared chapter loader so every source
 * (seeded DB, licensed proxy, open API) works, and skips chapters already cached.
 */
export async function downloadTranslationPack(
  translation: string,
  scope: PackScope,
  onProgress?: (current: number, total: number) => void,
  shouldStop?: () => boolean
): Promise<{ saved: number; failed: number; stopped: boolean }> {
  const { loadChapterText } = await import("@/lib/bibleText");
  const books = booksForScope(scope);
  const total = chapterCountForScope(scope);

  let done = 0;
  let saved = 0;
  let failed = 0;

  for (const book of books) {
    for (let ch = 1; ch <= (BOOK_CHAPTERS[book] || 0); ch++) {
      if (shouldStop?.()) return { saved, failed, stopped: true };

      const existing = await getChapter(book, ch, translation).catch(() => null);
      if (isValidChapterData(existing)) {
        done++;
        onProgress?.(done, total);
        continue;
      }

      try {
        const data = await loadChapterText(book, ch, translation);
        if (isValidChapterData(data)) saved++;
        else failed++;
      } catch {
        failed++;
      }

      done++;
      onProgress?.(done, total);
    }
  }

  return { saved, failed, stopped: false };
}
