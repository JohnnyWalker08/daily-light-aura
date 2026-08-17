import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// USFM book codes used by YouVersion / API.Bible
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
const SERVER_YV_KEY = Deno.env.get("YOUVERSION_API_KEY") || "";

type Keys = Partial<Record<"youversion" | "esv" | "nlt" | "apibible", string>>;

function readKeys(body: any): Keys {
  const raw = body?.keys && typeof body.keys === "object" ? body.keys : {};
  const pick = (k: string) => {
    const v = raw[k];
    return typeof v === "string" && v.trim().length > 3 && v.length < 400 ? v.trim() : undefined;
  };
  return {
    youversion: pick("youversion") || SERVER_YV_KEY || undefined,
    esv: pick("esv"),
    nlt: pick("nlt"),
    apibible: pick("apibible"),
  };
}

function yvFetch(path: string, key: string) {
  return fetch(`${YV}${path}`, {
    headers: { "x-yvp-app-key": key, Accept: "application/json" },
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

/** YouVersion HTML marks each verse with <span class="yv-v" v="N"></span>. */
function parseChapterHtml(html: string) {
  const verses: Array<{ verse: number; text: string }> = [];
  const marker = /<span[^>]*class="[^"]*yv-v"[^>]*\sv="(\d+)"[^>]*>\s*<\/span>/g;

  const hits: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = marker.exec(html))) {
    hits.push({ num: Number(m[1]), start: m.index + m[0].length });
  }

  for (let i = 0; i < hits.length; i++) {
    const slice = html.slice(hits[i].start, i + 1 < hits.length ? hits[i + 1].start : html.length);
    const text = clean(slice.replace(/<span[^>]*class="[^"]*yv-vlbl[^"]*"[^>]*>[\s\S]*?<\/span>/g, " "));
    if (!text) continue;
    const existing = verses.find((v) => v.verse === hits[i].num);
    if (existing) existing.text = `${existing.text} ${text}`.trim();
    else verses.push({ verse: hits[i].num, text });
  }

  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

/** ESV API text format: "[1] In the beginning ... [2] ..." */
function parseEsvText(text: string) {
  const verses: Array<{ verse: number; text: string }> = [];
  const parts = text.split(/\[(\d+)\]/).slice(1);
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const num = Number(parts[i]);
    const body = parts[i + 1].replace(/\s+/g, " ").replace(/\(ESV\)\s*$/i, "").trim();
    if (num && body) verses.push({ verse: num, text: body });
  }
  return verses;
}

/** NLT API returns HTML with <span class="vn">N</span> before each verse. */
function parseNltHtml(html: string) {
  const body = html.replace(/<h\d[\s\S]*?<\/h\d>/g, " ");
  const verses: Array<{ verse: number; text: string }> = [];
  const marker = /<span[^>]*class="[^"]*\bvn\b[^"]*"[^>]*>\s*(\d+)\s*<\/span>/g;
  const hits: Array<{ num: number; start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = marker.exec(body))) hits.push({ num: Number(m[1]), start: m.index + m[0].length, end: 0 });
  for (let i = 0; i < hits.length; i++) {
    const slice = body.slice(hits[i].start, i + 1 < hits.length ? hits[i + 1].start : body.length);
    const text = clean(slice.replace(/<span[^>]*class="[^"]*\btn\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, " "));
    if (!text) continue;
    const existing = verses.find((v) => v.verse === hits[i].num);
    if (existing) existing.text = `${existing.text} ${text}`.trim();
    else verses.push({ verse: hits[i].num, text });
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

/** API.Bible HTML content marks verses with data-number="N". */
function parseApiBibleHtml(html: string) {
  const verses: Array<{ verse: number; text: string }> = [];
  const marker = /data-number="(\d+)"[^>]*>/g;
  const hits: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = marker.exec(html))) hits.push({ num: Number(m[1]), start: m.index + m[0].length });
  for (let i = 0; i < hits.length; i++) {
    const slice = html.slice(hits[i].start, i + 1 < hits.length ? hits[i + 1].start : html.length);
    const text = clean(slice);
    if (!text) continue;
    const existing = verses.find((v) => v.verse === hits[i].num);
    if (existing) existing.text = `${existing.text} ${text}`.trim();
    else verses.push({ verse: hits[i].num, text });
  }
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

async function fetchChapter(
  provider: string,
  code: string,
  book: string,
  chapter: number,
  verse: number | null,
  keys: Keys
): Promise<{ verses: Array<{ verse: number; text: string }>; reference?: string } | { error: string; status?: number }> {
  const usfm = USFM[book];
  if (!usfm) return { error: "unknown_book" };
  const ref = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  if (provider === "esv") {
    if (!keys.esv) return { error: "missing_key" };
    const url =
      `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref)}` +
      `&include-headings=false&include-footnotes=false&include-passage-references=false` +
      `&include-short-copyright=false&include-verse-numbers=true&indent-paragraphs=0`;
    const res = await fetch(url, { headers: { Authorization: `Token ${keys.esv}` } });
    if (!res.ok) return { error: "unavailable", status: res.status };
    const payload = await res.json();
    const verses = parseEsvText(String((payload?.passages || []).join("\n")));
    return { verses, reference: ref };
  }

  if (provider === "nlt") {
    if (!keys.nlt) return { error: "missing_key" };
    const url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${encodeURIComponent(keys.nlt)}`;
    const res = await fetch(url);
    if (!res.ok) return { error: "unavailable", status: res.status };
    const html = await res.text();
    return { verses: parseNltHtml(html), reference: ref };
  }

  if (provider === "apibible") {
    if (!keys.apibible) return { error: "missing_key" };
    const id = verse ? `${usfm}.${chapter}.${verse}` : `${usfm}.${chapter}`;
    const path = verse ? "verses" : "chapters";
    const url = `https://api.scripture.api.bible/v1/bibles/${code}/${path}/${id}?content-type=html&include-notes=false&include-titles=false&include-verse-numbers=true`;
    const res = await fetch(url, { headers: { "api-key": keys.apibible } });
    if (!res.ok) return { error: "unavailable", status: res.status };
    const payload = await res.json();
    const verses = parseApiBibleHtml(String(payload?.data?.content || ""));
    return { verses, reference: payload?.data?.reference || ref };
  }

  // default: YouVersion
  if (!keys.youversion) return { error: "missing_key" };
  if (verse) {
    const res = await yvFetch(`/v1/bibles/${code}/passages/${usfm}.${chapter}.${verse}`, keys.youversion);
    if (!res.ok) return { error: "unavailable", status: res.status };
    const payload = await res.json();
    const text = clean(String(payload?.content || ""));
    return { verses: text ? [{ verse, text }] : [], reference: payload?.reference || ref };
  }
  const res = await yvFetch(`/v1/bibles/${code}/passages/${usfm}.${chapter}?format=html`, keys.youversion);
  if (!res.ok) return { error: "unavailable", status: res.status };
  const payload = await res.json();
  return { verses: parseChapterHtml(String(payload?.content || "")), reference: payload?.reference || ref };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? url.searchParams.get("action") ?? "chapter");
    const keys = readKeys(body);

    // --- Validate a provider key from the licensing screen ------------------
    if (action === "validate") {
      const provider = String(body.provider || "");
      const key = String(body.key || "").trim();
      if (!key) return json({ ok: false, error: "empty_key" });
      try {
        if (provider === "esv") {
          const res = await fetch(
            "https://api.esv.org/v3/passage/text/?q=John+1:1&include-short-copyright=false",
            { headers: { Authorization: `Token ${key}` } }
          );
          return json({ ok: res.ok, status: res.status });
        }
        if (provider === "nlt") {
          const res = await fetch(
            `https://api.nlt.to/api/passages?ref=John+1:1&version=NLT&key=${encodeURIComponent(key)}`
          );
          const text = res.ok ? await res.text() : "";
          return json({ ok: res.ok && text.length > 20, status: res.status });
        }
        if (provider === "apibible") {
          const res = await fetch("https://api.scripture.api.bible/v1/bibles", {
            headers: { "api-key": key },
          });
          if (!res.ok) return json({ ok: false, status: res.status });
          const payload = await res.json();
          const bibles = (payload?.data || []).map((b: any) => ({
            id: String(b.id),
            abbrev: b.abbreviationLocal || b.abbreviation,
            title: b.nameLocal || b.name,
            language: b?.language?.id,
          }));
          return json({ ok: true, bibles });
        }
        // youversion
        const res = await yvFetch(`/v1/bibles?language_ranges[]=eng`, key);
        if (!res.ok) return json({ ok: false, status: res.status });
        const payload = await res.json();
        const versions = (payload?.data || []).map((v: any) => String(v.id));
        return json({ ok: true, versions });
      } catch (error) {
        return json({ ok: false, error: String((error as Error)?.message || error) });
      }
    }

    // --- Which licensed versions are reachable right now --------------------
    if (action === "versions") {
      if (!keys.youversion) return json({ versions: [] });
      const res = await yvFetch(`/v1/bibles?language_ranges[]=eng`, keys.youversion);
      if (!res.ok) return json({ versions: [], status: res.status });
      const payload = await res.json();
      const versions = (payload?.data || []).map((v: any) => ({
        id: String(v.id),
        abbrev: v.localized_abbreviation || v.abbreviation,
        title: v.localized_title || v.title,
      }));
      return json({ versions });
    }

    const provider = String(body.provider ?? url.searchParams.get("provider") ?? "youversion");
    const version = String(body.version ?? url.searchParams.get("version") ?? "111");
    const book = String(body.book ?? url.searchParams.get("book") ?? "John");
    const chapter = Number(body.chapter ?? url.searchParams.get("chapter") ?? 1);
    const verseRaw = body.verse ?? url.searchParams.get("verse");
    const verse = verseRaw ? Number(verseRaw) : null;

    if (!USFM[book]) return json({ error: "unknown_book", book }, 400);
    if (!Number.isFinite(chapter) || chapter < 1) return json({ error: "bad_chapter" }, 400);

    const result = await fetchChapter(provider, version, book, chapter, verse, keys);
    if ("error" in result) return json(result, result.error === "missing_key" ? 503 : 502);
    if (!result.verses.length) return json({ error: "empty" }, 502);

    return json({
      reference: result.reference || `${book} ${chapter}`,
      verses: result.verses,
      translation: version,
    });
  } catch (error) {
    return json({ error: String((error as Error)?.message || error) }, 500);
  }
});
