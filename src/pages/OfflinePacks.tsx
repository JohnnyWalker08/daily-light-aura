import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, CloudDownload, Loader2, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import {
  chapterCountForScope,
  deletePack,
  downloadTranslationPack,
  getPackStats,
  PACK_SCOPES,
  PackScope,
} from "@/lib/offlineBible";
import { getAvailableTranslationIds } from "@/lib/bibleText";
import { TRANSLATION_GROUPS, TRANSLATIONS } from "@/lib/translations";

export default function OfflinePacks() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState<Set<string>>(
    new Set(TRANSLATIONS.map((translation) => translation.id))
  );
  const [scope, setScope] = useState<PackScope>("whole");
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const stopRef = useRef(false);

  const refresh = () => getPackStats().then(setStats).catch(() => {});

  useEffect(() => {
    refresh();
    getAvailableTranslationIds().then(setAvailable).catch(() => {});
  }, []);

  const download = async (id: string) => {
    stopRef.current = false;
    setBusy(id);
    setProgress({ current: 0, total: chapterCountForScope(scope) });
    try {
      const result = await downloadTranslationPack(
        id,
        scope,
        (current, total) => setProgress({ current, total }),
        () => stopRef.current
      );
      if (result.stopped) toast.info("Download stopped — what was saved stays offline.");
      else if (result.failed > 0)
        toast.warning(`Saved with gaps: ${result.failed} chapters could not be fetched. Run it again to fill them.`);
      else toast.success("Pack ready — read it with no internet.");
    } catch {
      toast.error("Download failed. Check your connection and try again.");
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const remove = async (id: string) => {
    await deletePack(id);
    refresh();
    toast.success("Offline pack removed");
  };

  const scopeTotal = chapterCountForScope(scope);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>

        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Offline packs</h1>
          <p className="text-muted-foreground">
            Choose which translations live on your device — read anywhere, with no signal.
          </p>
        </div>

        <Card className="glass-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <WifiOff className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">How much to download</p>
              <p className="text-xs text-muted-foreground">{scopeTotal} chapters per translation</p>
            </div>
          </div>
          <Select value={scope} onValueChange={(v) => setScope(v as PackScope)}>
            <SelectTrigger className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACK_SCOPES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label} — {s.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {busy && (
          <Card className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">
                Downloading {TRANSLATIONS.find((t) => t.id === busy)?.abbrev}…
              </p>
              <Button variant="ghost" size="sm" onClick={() => (stopRef.current = true)}>
                Stop
              </Button>
            </div>
            <Progress
              value={progress.total ? (progress.current / progress.total) * 100 : 0}
              className="h-2 mb-1"
            />
            <p className="text-xs text-muted-foreground">
              {progress.current} of {progress.total} chapters
            </p>
          </Card>
        )}

        {TRANSLATION_GROUPS.map((group) => {
          const items = TRANSLATIONS.filter((t) => t.group === group && available.has(t.id));
          if (!items.length) return null;
          return (
            <div key={group} className="mb-8">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">{group}</h2>
              <div className="space-y-2">
                {items.map((t) => {
                  const cached = stats[t.id] || 0;
                  const complete = cached >= scopeTotal;
                  return (
                    <Card key={t.id} className="glass-card p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{t.abbrev}</p>
                          {cached > 0 && (
                            <Badge variant={complete ? "default" : "secondary"} className="gap-1">
                              {complete && <CheckCircle2 className="h-3 w-3" />}
                              {cached} chapters offline
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{t.name}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={Boolean(busy)}
                          onClick={() => download(t.id)}
                        >
                          {busy === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CloudDownload className="h-4 w-4" />
                          )}
                        </Button>
                        {cached > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={Boolean(busy)}
                            onClick={() => remove(t.id)}
                            aria-label={`Remove ${t.abbrev} pack`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
