import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { getAvailableTranslationIds, loadVerseText } from "@/lib/bibleText";
import { TRANSLATIONS, getTranslation } from "@/lib/translations";

interface VersePeekProps {
  book: string;
  chapter: number;
  verse: number | null;
  currentTranslation: string;
  onClose: () => void;
}

interface Row {
  id: string;
  abbrev: string;
  name: string;
  text: string | null;
}

/** Shows a single verse side by side in every translation available. */
export function VersePeek({ book, chapter, verse, currentTranslation, onClose }: VersePeekProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verse === null) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setRows([]);
      const availableIds = await getAvailableTranslationIds();
      const ordered = TRANSLATIONS.filter((t) => availableIds.has(t.id)).sort((a, b) =>
        a.id === currentTranslation ? -1 : b.id === currentTranslation ? 1 : 0
      );

      for (const t of ordered) {
        const text = await loadVerseText(book, chapter, verse, t.id).catch(() => null);
        if (cancelled) return;
        if (text) {
          setRows((prev) => [...prev, { id: t.id, abbrev: t.abbrev, name: t.name, text }]);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, verse, currentTranslation]);

  return (
    <Dialog open={verse !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="font-display">
            {book} {chapter}:{verse} — in every version
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-5 pb-5">
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-border/60 p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">{row.abbrev}</span>
                  <span className="text-xs text-muted-foreground truncate">{row.name}</span>
                </div>
                <p
                  className="text-foreground leading-relaxed"
                  style={{ fontFamily: "var(--reader-font-family)" }}
                >
                  {row.text}
                </p>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gathering more versions…
              </div>
            )}

            {!loading && rows.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                Couldn’t load this verse in other versions right now.
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="px-5 pb-5">
          <p className="text-xs text-muted-foreground">
            Reading a verse in several translations is one of the fastest ways to see what it actually
            says. Currently reading: {getTranslation(currentTranslation).abbrev}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
