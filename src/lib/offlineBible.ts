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

export async function saveChapter(book: string, chapter: number, data: any) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${book}_${chapter}`;
    
    const request = store.put({ key, data });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getChapter(book: string, chapter: number): Promise<any | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${book}_${chapter}`;
    
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
        if (dbData) {
          await saveToDb(key, dbData);
        } else {
          // Fallback to API if not in DB yet
          const url = `https://bible-api.com/${encodeURIComponent(book)}+${ch}?translation=kjv`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await response.json();
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
