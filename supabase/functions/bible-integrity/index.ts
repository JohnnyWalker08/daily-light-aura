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
const EXPECTED_BOOKS = BOOKS.length;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAllRows(supabase: ReturnType<typeof createClient>) {
  const rows: Array<{ book: string; chapter: number; data: any }> = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("bible_chapters")
      .select("book, chapter, data")
      .order("book", { ascending: true })
      .order("chapter", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...((data || []) as Array<{ book: string; chapter: number; data: any }>));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

function inspectVerseGaps(row: { book: string; chapter: number; data: any }) {
  const verses = Array.isArray(row.data?.verses) ? row.data.verses : [];
  const verseNumbers = verses.map((verse: any) => verse?.verse).filter((verse: any) => typeof verse === "number");
  const maxVerse = verseNumbers.length ? Math.max(...verseNumbers) : 0;
  const seen = new Set(verseNumbers);
  const missingVerses: number[] = [];
  const duplicateVerses = verseNumbers.filter((verse, index) => verseNumbers.indexOf(verse) !== index);
  const blankVerses = verses
    .filter((verse: any) => typeof verse?.verse === "number" && typeof verse?.text === "string" && !verse.text.trim())
    .map((verse: any) => verse.verse);

  for (let verse = 1; verse <= maxVerse; verse++) {
    if (!seen.has(verse)) missingVerses.push(verse);
  }

  return {
    reference: `${row.book} ${row.chapter}`,
    book: row.book,
    chapter: row.chapter,
    verseCount: verses.length,
    maxVerse,
    missingVerses,
    duplicateVerses: [...new Set(duplicateVerses)],
    blankVerses,
    hasValidPayload: Boolean(row.data?.reference && verses.length > 0),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const rows = await getAllRows(supabase);
    const rowMap = new Map(rows.map((row) => [`${row.book}_${row.chapter}`, row]));
    const storedBookSet = new Set(rows.map((row) => row.book));
    const missingBooks = BOOKS.filter((book) => !storedBookSet.has(book));
    const unknownBooks = [...storedBookSet].filter((book) => !BOOK_CHAPTERS[book]);
    const missingChapters: Array<{ book: string; chapter: number }> = [];
    const bookSummaries = BOOKS.map((book) => {
      let storedChapters = 0;
      let storedVerses = 0;

      for (let chapter = 1; chapter <= BOOK_CHAPTERS[book]; chapter++) {
        const row = rowMap.get(`${book}_${chapter}`);
        if (!row) {
          missingChapters.push({ book, chapter });
          continue;
        }
        storedChapters++;
        storedVerses += Array.isArray(row.data?.verses) ? row.data.verses.length : 0;
      }

      return {
        book,
        expectedChapters: BOOK_CHAPTERS[book],
        storedChapters,
        missingChapters: BOOK_CHAPTERS[book] - storedChapters,
        storedVerses,
      };
    });

    const inspected = rows.map(inspectVerseGaps);
    const invalidChapters = inspected.filter(
      (chapter) =>
        !chapter.hasValidPayload ||
        chapter.verseCount === 0 ||
        chapter.missingVerses.length > 0 ||
        chapter.duplicateVerses.length > 0 ||
        chapter.blankVerses.length > 0
    );
    const totalVerses = inspected.reduce((sum, chapter) => sum + chapter.verseCount, 0);
    const complete =
      rows.length === TOTAL_CHAPTERS &&
      storedBookSet.size === EXPECTED_BOOKS &&
      missingBooks.length === 0 &&
      missingChapters.length === 0 &&
      unknownBooks.length === 0 &&
      invalidChapters.length === 0;

    return new Response(
      JSON.stringify({
        status: complete ? "complete" : "needs_attention",
        complete,
        totals: {
          expectedBooks: EXPECTED_BOOKS,
          storedBooks: storedBookSet.size,
          expectedChapters: TOTAL_CHAPTERS,
          storedChapters: rows.length,
          missingChapters: missingChapters.length,
          totalVerses,
          invalidChapters: invalidChapters.length,
        },
        missingBooks,
        unknownBooks,
        missingChapters,
        invalidChapters,
        bookSummaries,
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
