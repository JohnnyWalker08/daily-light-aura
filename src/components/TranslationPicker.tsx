import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search, WifiOff } from "lucide-react";
import { TRANSLATIONS, TRANSLATION_GROUPS, type TranslationMeta } from "@/lib/translations";
import { getTranslationAvailability, type TranslationAvailability } from "@/lib/bibleText";

interface TranslationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSelect: (id: string) => void;
  title?: string;
  /** Translation to grey out (already used in the other column of compare view) */
  excludeId?: string;
}

export function TranslationPicker({
  open,
  onOpenChange,
  value,
  onSelect,
  title = "Choose a translation",
  excludeId,
}: TranslationPickerProps) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<TranslationAvailability>({
    ids: new Set(TRANSLATIONS.map((translation) => translation.id)),
    status: "checking",
  });

  useEffect(() => {
    if (!open) return;
    setAvailability((current) => ({ ...current, status: "checking" }));
    getTranslationAvailability().then(setAvailability).catch(() => {
      setAvailability({ ids: new Set(TRANSLATIONS.map((translation) => translation.id)), status: "unreachable" });
    });
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRANSLATIONS;
    return TRANSLATIONS.filter(
      (t) =>
        t.abbrev.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q)
    );
  }, [query]);

  const handlePick = (t: TranslationMeta) => {
    if (t.id === excludeId) return;
    onSelect(t.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search versions (NIV, literal, easy…)"
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[60vh] px-2 pb-4">
          {TRANSLATION_GROUPS.map((group) => {
            const items = filtered.filter((t) => t.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-3">
                <p className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {group}
                </p>
                <div className="space-y-1">
                  {items.map((t) => {
                    const active = t.id === value;
                    const disabled = t.id === excludeId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handlePick(t)}
                        disabled={disabled}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-start gap-3 ${
                          active ? "bg-primary/10" : "hover:bg-muted/60"
                        } ${disabled ? "opacity-45 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`mt-0.5 shrink-0 min-w-[3.25rem] text-center text-xs font-bold px-2 py-1 rounded-lg ${
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.abbrev}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">{t.name}</span>
                            {t.id === "kjv" && (
                              <Badge variant="secondary" className="gap-1 text-[10px]">
                                <WifiOff className="h-3 w-3" /> Offline
                              </Badge>
                            )}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {t.blurb}
                          </span>
                        </span>
                        {active && <Check className="h-4 w-4 text-primary shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {availability.status === "unreachable" && (
            <p className="px-4 pt-2 text-xs text-muted-foreground">
              The version catalog could not be refreshed. You can still open any version and use text already saved offline.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
