import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// USFM book codes used by YouVersion
const USFM: Record<string, string> = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU",
  "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA",
  "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
  "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM",
  "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
  "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL", "Ephesians": "EPH",
  "Philippians": "PHP", "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
  "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
};

const KEY = Deno.env.get("YOUVERSION_API_KEY") || "";

const HEADER_SETS: Array<[string, Record<string, string>]> = [
  ["yvp", { "x-yvp-app-key": KEY, Accept: "application/json" }],
  ["yvp-bearer", { "x-yvp-app-key": KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" }],
];


const URL_BUILDERS: Array<[string, (v: string, usfm: string) => string]> = [
  ["v1-chapters", (v, u) => `https://api.youversion.com/v1/bibles/${v}/chapters/${u}`],
  ["v1-chapter-q", (v, u) => `https://api.youversion.com/v1/bible/chapter?version_id=${v}&reference=${u}`],
  ["v1-verses", (v, u) => `https://api.youversion.com/v1/bibles/${v}/verses/${u}`],
  ["scripture-chapters", (v, u) => `https://api.scripture.api.bible/v1/bibles/${v}/chapters/${u}`],
];

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Try to normalise whatever shape the provider returns into {reference, verses[]} */
function normalise(payload: any, book: string, chapter: number) {
  const verses: Array<{ verse: number; text: string }> = [];

  const pushVerse = (n: any, t: any) => {
    const num = Number(n);
    const text = stripHtml(String(t ?? ""));
    if (Number.isFinite(num) && num > 0 && text) verses.push({ verse: num, text });
  };

  const arr =
    payload?.verses ||
    payload?.data?.verses ||
    payload?.content?.verses ||
    (Array.isArray(payload?.data) ? payload.data : null);

  if (Array.isArray(arr)) {
    for (const v of arr) {
      pushVerse(v.verse ?? v.number ?? v.verse_number ?? v.usfm?.split(".").pop(), v.text ?? v.content ?? v.value);
    }
  }

  // HTML/plain content blob: split on verse markers
  if (!verses.length) {
    const html = payload?.data?.content ?? payload?.content ?? payload?.chapter?.content;
    if (typeof html === "string" && html.length) {
      const plain = stripHtml(html);
      const parts = plain.split(/(?=\b\d{1,3}\s)/g);
      let n = 0;
      for (const p of parts) {
        const m = p.match(/^(\d{1,3})\s+(.*)$/s);
        if (m) {
          n = Number(m[1]);
          pushVerse(n, m[2]);
        }
      }
    }
  }

  verses.sort((a, b) => a.verse - b.verse);
  if (!verses.length) return null;
  return { reference: `${book} ${chapter}`, verses };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!KEY) return json({ error: "not_configured" }, 503);

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const book = String(body.book ?? url.searchParams.get("book") ?? "John");
    const chapter = Number(body.chapter ?? url.searchParams.get("chapter") ?? 1);
    const version = String(body.version ?? url.searchParams.get("version") ?? "111");
    const probe = url.searchParams.get("probe") === "1" || body.probe === true;

    const code = USFM[book];
    if (!code) return json({ error: "unknown_book", book }, 400);
    const usfm = `${code}.${chapter}`;

    if (probe) {
      const results: any[] = [];
      for (const [uName, build] of URL_BUILDERS) {
        for (const [hName, headers] of HEADER_SETS) {
          try {
            const res = await fetch(build(version, usfm), { headers });
            const text = (await res.text()).slice(0, 200);
            results.push({ url: uName, headers: hName, status: res.status, sample: text });
          } catch (e) {
            results.push({ url: uName, headers: hName, error: String((e as Error).message) });
          }
        }
      }
      return json({ probe: results });
    }

    for (const [, build] of URL_BUILDERS) {
      for (const [, headers] of HEADER_SETS) {
        try {
          const res = await fetch(build(version, usfm), { headers });
          if (!res.ok) continue;
          const payload = await res.json().catch(() => null);
          const data = payload && normalise(payload, book, chapter);
          if (data) return json({ ...data, translation: version });
        } catch {
          // try next combination
        }
      }
    }

    return json({ error: "unavailable" }, 502);
  } catch (error) {
    return json({ error: String((error as Error)?.message || error) }, 500);
  }
});
