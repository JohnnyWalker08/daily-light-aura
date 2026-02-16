import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOOK_CHAPTERS: Record<string, number> = {
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
  "3 John": 1, "Jude": 1, "Revelation": 22,
};

const BOOKS = Object.keys(BOOK_CHAPTERS);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (attempt < retries && (res.status === 429 || res.status >= 500)) {
        await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries reached");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Accept optional book param to seed a specific book, or find the next missing book
  const url = new URL(req.url);
  let targetBook = url.searchParams.get("book");

  // Get all existing chapters
  const { data: existing } = await supabase
    .from("bible_chapters")
    .select("book, chapter");

  const existingSet = new Set((existing || []).map((r: any) => `${r.book}_${r.chapter}`));
  const totalChapters = Object.values(BOOK_CHAPTERS).reduce((a, b) => a + b, 0);

  if (existingSet.size >= totalChapters) {
    return new Response(
      JSON.stringify({ status: "complete", seeded: totalChapters, total: totalChapters }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find the next book(s) that need seeding
  if (!targetBook) {
    for (const book of BOOKS) {
      for (let ch = 1; ch <= BOOK_CHAPTERS[book]; ch++) {
        if (!existingSet.has(`${book}_${ch}`)) {
          targetBook = book;
          break;
        }
      }
      if (targetBook) break;
    }
  }

  if (!targetBook) {
    return new Response(
      JSON.stringify({ status: "complete", seeded: existingSet.size, total: totalChapters }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Seed the target book
  const chapters = BOOK_CHAPTERS[targetBook];
  const missing: number[] = [];
  for (let ch = 1; ch <= chapters; ch++) {
    if (!existingSet.has(`${targetBook}_${ch}`)) {
      missing.push(ch);
    }
  }

  console.log(`Seeding ${targetBook}: ${missing.length} missing chapters`);

  let seeded = 0;
  const failures: number[] = [];

  // Process 3 at a time
  for (let i = 0; i < missing.length; i += 3) {
    const batch = missing.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async (ch) => {
        const apiUrl = `https://bible-api.com/${encodeURIComponent(targetBook!)}+${ch}?translation=kjv`;
        const res = await fetchWithRetry(apiUrl);
        const data = await res.json();
        const { error } = await supabase.from("bible_chapters").upsert(
          { book: targetBook, chapter: ch, data },
          { onConflict: "book,chapter" }
        );
        if (error) throw error;
      })
    );

    for (let j = 0; j < results.length; j++) {
      if (results[j].status === "fulfilled") seeded++;
      else failures.push(batch[j]);
    }

    if (i + 3 < missing.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  // Find next book needing seeding
  let nextBook: string | null = null;
  const bookIdx = BOOKS.indexOf(targetBook);
  for (let i = bookIdx + 1; i < BOOKS.length; i++) {
    for (let ch = 1; ch <= BOOK_CHAPTERS[BOOKS[i]]; ch++) {
      if (!existingSet.has(`${BOOKS[i]}_${ch}`)) {
        nextBook = BOOKS[i];
        break;
      }
    }
    if (nextBook) break;
  }

  return new Response(
    JSON.stringify({
      status: nextBook || failures.length > 0 ? "in_progress" : "complete",
      book: targetBook,
      seeded,
      failures: failures.length,
      totalSeeded: existingSet.size + seeded,
      total: totalChapters,
      nextBook,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
