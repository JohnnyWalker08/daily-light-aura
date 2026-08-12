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

const YV = "https://api.youversion.com";
const KEY = Deno.env.get("YOUVERSION_API_KEY") || "";

function yvFetch(path: string) {
  return fetch(`${YV}${path}`, {
    headers: { "x-yvp-app-key": KEY, Accept: "application/json" },
  });
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

function clean(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * YouVersion HTML marks each verse with <span class="yv-v" v="N"></span>
 * followed by an optional <span class="yv-vlbl">N</span> label and the text.
 */
function parseChapterHtml(html: string) {
  const verses: Array<{ verse: number; text: string }> = [];
  const marker = /<span[^>]*class="[^"]*yv-v"[^>]*\sv="(\d+)"[^>]*>\s*<\/span>/g;

  const hits: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = marker.exec(html))) {
    hits.push({ num: Number(m[1]), start: m.index + m[0].length });
  }

  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? html.indexOf("<span", hits[i + 1].start - 200) : html.length;
    const slice = html.slice(hits[i].start, i + 1 < hits.length ? hits[i + 1].start - 0 : html.length);
    // Drop the visible verse-number label so it does not duplicate in the text
    const text = clean(slice.replace(/<span[^>]*class="[^"]*yv-vlbl[^"]*"[^>]*>[\s\S]*?<\/span>/g, " "));
    if (!text) continue;
    const existing = verses.find((v) => v.verse === hits[i].num);
    if (existing) existing.text = `${existing.text} ${text}`.trim();
    else verses.push({ verse: hits[i].num, text });
    void end;
  }

  verses.sort((a, b) => a.verse - b.verse);
  return verses;
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
    const action = String(body.action ?? url.searchParams.get("action") ?? "chapter");

    if (action === "versions") {
      const res = await yvFetch(`/v1/bibles?language_ranges[]=eng`);
      if (!res.ok) return json({ error: "versions_unavailable", status: res.status }, 502);
      const payload = await res.json();
      const versions = (payload?.data || []).map((v: any) => ({
        id: String(v.id),
        abbrev: v.localized_abbreviation || v.abbreviation,
        title: v.localized_title || v.title,
      }));
      return json({ versions });
    }

    const version = String(body.version ?? url.searchParams.get("version") ?? "111");
    const book = String(body.book ?? url.searchParams.get("book") ?? "John");
    const chapter = Number(body.chapter ?? url.searchParams.get("chapter") ?? 1);
    const verse = body.verse ?? url.searchParams.get("verse");

    const code = USFM[book];
    if (!code) return json({ error: "unknown_book", book }, 400);

    // Single-verse lookup (used by the "compare this verse" peek)
    if (verse) {
      const res = await yvFetch(`/v1/bibles/${version}/passages/${code}.${chapter}.${Number(verse)}`);
      if (!res.ok) return json({ error: "unavailable", status: res.status }, 502);
      const payload = await res.json();
      const text = clean(String(payload?.content || ""));
      if (!text) return json({ error: "empty" }, 502);
      return json({
        reference: payload?.reference || `${book} ${chapter}:${verse}`,
        verses: [{ verse: Number(verse), text }],
        translation: version,
      });
    }

    const res = await yvFetch(`/v1/bibles/${version}/passages/${code}.${chapter}?format=html`);
    if (!res.ok) return json({ error: "unavailable", status: res.status }, 502);
    const payload = await res.json();
    const verses = parseChapterHtml(String(payload?.content || ""));
    if (!verses.length) return json({ error: "empty" }, 502);

    return json({
      reference: payload?.reference || `${book} ${chapter}`,
      verses,
      translation: version,
    });
  } catch (error) {
    return json({ error: String((error as Error)?.message || error) }, 500);
  }
});
