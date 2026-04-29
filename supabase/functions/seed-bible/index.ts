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
const TOTAL_CHAPTERS = Object.values(BOOK_CHAPTERS).reduce((a, b) => a + b, 0);

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
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries reached");
}

async function getExistingChapters(supabase: ReturnType<typeof createClient>) {
  const rows: Array<{ book: string; chapter: number }> = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("bible_chapters")
      .select("book, chapter")
      .order("book", { ascending: true })
      .order("chapter", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...((data || []) as Array<{ book: string; chapter: number }>));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

function isValidChapterData(data: any) {
  return Boolean(
    data?.reference &&
      Array.isArray(data?.verses) &&
      data.verses.length > 0 &&
      data.verses.every((verse: any) => typeof verse?.verse === "number" && typeof verse?.text === "string" && verse.text.trim())
  );
}

function buildMissingQueue(existingSet: Set<string>, targetBook: string | null, limit: number) {
  const queue: Array<{ book: string; chapter: number }> = [];
  const books = targetBook ? [targetBook] : BOOKS;

  for (const book of books) {
    const chapters = BOOK_CHAPTERS[book];
    if (!chapters) continue;
    for (let chapter = 1; chapter <= chapters; chapter++) {
      if (!existingSet.has(`${book}_${chapter}`)) {
        queue.push({ book, chapter });
        if (queue.length >= limit) return queue;
      }
    }
  }

  return queue;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const url = new URL(req.url);
    const targetBook = url.searchParams.get("book");
    const requestedLimit = Number(url.searchParams.get("limit") || "36");
    const limit = Math.max(1, Math.min(60, Number.isFinite(requestedLimit) ? requestedLimit : 36));

    const existing = await getExistingChapters(supabase);
    const existingSet = new Set(existing.map((r) => `${r.book}_${r.chapter}`));

    if (existingSet.size >= TOTAL_CHAPTERS) {
      return new Response(
        JSON.stringify({ status: "complete", seeded: 0, totalSeeded: existingSet.size, total: TOTAL_CHAPTERS }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const queue = buildMissingQueue(existingSet, targetBook, limit);
    let seeded = 0;
    const failures: Array<{ book: string; chapter: number; error: string }> = [];

    for (let i = 0; i < queue.length; i += 3) {
      const batch = queue.slice(i, i + 3);
      const results = await Promise.allSettled(
        batch.map(async ({ book, chapter }) => {
          const apiUrl = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=kjv`;
          const res = await fetchWithRetry(apiUrl);
          const data = await res.json();
          if (!isValidChapterData(data)) throw new Error("Incomplete chapter payload");
          const { error } = await supabase
            .from("bible_chapters")
            .upsert({ book, chapter, data }, { onConflict: "book,chapter" });
          if (error) throw error;
        })
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const item = batch[j];
        if (result.status === "fulfilled") {
          seeded++;
          existingSet.add(`${item.book}_${item.chapter}`);
        } else {
          failures.push({ book: item.book, chapter: item.chapter, error: String(result.reason?.message || result.reason) });
        }
      }

      if (i + 3 < queue.length) await new Promise((r) => setTimeout(r, 250));
    }

    const nextQueue = buildMissingQueue(existingSet, null, 1);
    const totalSeeded = existingSet.size;

    return new Response(
      JSON.stringify({
        status: totalSeeded >= TOTAL_CHAPTERS ? "complete" : "in_progress",
        seeded,
        attempted: queue.length,
        failures,
        totalSeeded,
        total: TOTAL_CHAPTERS,
        remaining: Math.max(0, TOTAL_CHAPTERS - totalSeeded),
        next: nextQueue[0] || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", error: String(error?.message || error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
