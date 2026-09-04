import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Bookmark, Layers, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addBookmark } from "@/lib/bookmarkStorage";
import { getAvailableTranslationIds, loadVerseText } from "@/lib/bibleText";
import { getTranslation, TRANSLATIONS } from "@/lib/translations";
import { getUserSettings } from "@/lib/settingsStorage";
import { streamCoach } from "@/lib/reflectionCoach";

interface SearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const SEARCH_SET_KEY = "dailylight_search_translations";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<Set<string>>(
    new Set(TRANSLATIONS.map((translation) => translation.id))
  );
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SEARCH_SET_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : [getUserSettings().translation || "kjv"];
    } catch {
      return ["kjv"];
    }
  });
  // reference -> translation -> text
  const [versions, setVersions] = useState<Record<string, Record<string, string | null>>>({});
  const [related, setRelated] = useState<Record<string, string>>({});
  const [relatedBusy, setRelatedBusy] = useState<string | null>(null);

  useEffect(() => {
    getAvailableTranslationIds().then(setAvailable).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(SEARCH_SET_KEY, JSON.stringify(selected));
  }, [selected]);

  const options = useMemo(() => TRANSLATIONS.filter((t) => available.has(t.id)), [available]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) || [] : [...prev, id]));

  const parseReference = (ref: string) => {
    const match = /^(.*?)\s+(\d+):(\d+)$/.exec(ref);
    if (!match) return null;
    return { book: match[1], chapter: Number(match[2]), verse: Number(match[3]) };
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setVersions({});
    setRelated({});

    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);
      const data = await response.json();

      if (!data?.verses?.length) {
        toast.error("No results found. Try 'John 3:16', 'Psalm 23' or 'Romans 8:28-30'");
        setResults([]);
        return;
      }

      const found: SearchResult[] = data.verses.map((v: any) => ({
        reference: `${v.book_name} ${v.chapter}:${v.verse}`,
        book: v.book_name,
        chapter: v.chapter,
        verse: v.verse,
        text: String(v.text).trim(),
      }));
      setResults(found);
      loadAcrossTranslations(found);
    } catch {
      toast.error("Search failed. Try a verse reference like 'John 3:16'");
    } finally {
      setLoading(false);
    }
  };

  /** Fetch each hit in every enabled translation, in parallel. */
  const loadAcrossTranslations = async (hits: SearchResult[]) => {
    const targets = selected.filter((id) => id !== "kjv");
    if (!targets.length) return;

    await Promise.all(
      hits.slice(0, 12).map(async (hit) => {
        const perVersion: Record<string, string | null> = {};
        await Promise.all(
          targets.map(async (id) => {
            perVersion[id] = await loadVerseText(hit.book, hit.chapter, hit.verse, id).catch(() => null);
          })
        );
        setVersions((prev) => ({ ...prev, [hit.reference]: perVersion }));
      })
    );
  };

  const showRelated = async (hit: SearchResult) => {
    setRelatedBusy(hit.reference);
    setRelated((prev) => ({ ...prev, [hit.reference]: "" }));
    try {
      await streamCoach(
        "related",
        { verseRef: hit.reference, verseText: hit.text },
        (full) => setRelated((prev) => ({ ...prev, [hit.reference]: full }))
      );
    } catch (error) {
      toast.error((error as Error).message);
      setRelated((prev) => {
        const next = { ...prev };
        delete next[hit.reference];
        return next;
      });
    } finally {
      setRelatedBusy(null);
    }
  };

  const handleBookmark = (result: SearchResult, translation: string, text: string) => {
    addBookmark({ reference: result.reference, text, translation });
    toast.success(`Saved in ${getTranslation(translation).abbrev}`);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Search the Bible</h1>
          <p className="text-muted-foreground">Search once — see it in every version you've enabled.</p>
        </div>

        <Card className="glass-card p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Try 'John 3:16', 'Psalm 23' or 'Romans 8:28-30'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              <SearchIcon className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" /> Compare across
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((t) => (
              <button key={t.id} onClick={() => toggle(t.id)} aria-pressed={selected.includes(t.id)}>
                <Badge variant={selected.includes(t.id) ? "default" : "secondary"} className="cursor-pointer">
                  {t.abbrev}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const perVersion = versions[result.reference] || {};
              return (
                <Card key={result.reference} className="glass-card p-6 animate-fade-in-up">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-display font-semibold text-primary">{result.reference}</h3>
                    <Button variant="ghost" size="icon" onClick={() => handleBookmark(result, "kjv", result.text)}>
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selected.includes("kjv") && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">KJV</p>
                        <p className="leading-relaxed">{result.text}</p>
                      </div>
                    )}
                    {selected
                      .filter((id) => id !== "kjv")
                      .map((id) => (
                        <div key={id}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {getTranslation(id).abbrev}
                            </p>
                            {perVersion[id] && (
                              <button
                                className="text-xs text-primary"
                                onClick={() => {
                                  const text = perVersion[id];
                                  if (text) handleBookmark(result, id, text);
                                }}
                              >
                                save
                              </button>
                            )}
                          </div>
                          <p className="leading-relaxed text-sm">
                            {perVersion[id] === undefined ? (
                              <span className="text-muted-foreground">Loading…</span>
                            ) : perVersion[id] === null ? (
                              <span className="text-muted-foreground">Not available in this version</span>
                            ) : (
                              perVersion[id]
                            )}
                          </p>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4">
                    {related[result.reference] === undefined ? (
                      <Button variant="outline" size="sm" onClick={() => showRelated(result)}>
                        <Sparkles className="h-4 w-4 mr-2" /> Related verses
                      </Button>
                    ) : (
                      <div className="rounded-xl bg-secondary/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                        {related[result.reference] || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Searching the thread…
                          </span>
                        )}
                        {relatedBusy === result.reference && related[result.reference] && (
                          <span className="animate-pulse">▍</span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {results.length === 0 && !loading && (
          <Card className="glass-card p-12 text-center">
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Search for a passage and read it side by side</p>
            <p className="text-sm text-muted-foreground mt-2">
              Examples: "John 3:16", "Psalm 23", "Romans 8:28-30"
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
