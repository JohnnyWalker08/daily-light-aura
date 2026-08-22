import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getApiBibleIds,
  getProviderKeys,
  KEY_PROVIDERS,
  KeyProvider,
  setApiBibleId,
  setProviderKey,
  validateProviderKey,
} from "@/lib/licenseKeys";
import { keyUnlockedTranslationIds, TRANSLATIONS } from "@/lib/translations";
import { clearAvailabilityCache, getAvailableTranslationIds } from "@/lib/bibleText";

export default function Licensing() {
  const [keys, setKeys] = useState(getProviderKeys());
  const [ids, setIds] = useState(getApiBibleIds());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState<KeyProvider | null>(null);
  const [available, setAvailable] = useState<Set<string>>(new Set());

  const refresh = () => {
    setKeys(getProviderKeys());
    setIds(getApiBibleIds());
  };

  useEffect(() => {
    getAvailableTranslationIds().then(setAvailable).catch(() => {});
  }, [keys, ids]);

  const unlockedByKeys = useMemo(() => keyUnlockedTranslationIds(keys, ids), [keys, ids]);

  const connect = async (provider: KeyProvider) => {
    const value = (drafts[provider] || "").trim();
    if (!value) {
      toast.error("Paste your key first");
      return;
    }
    setChecking(provider);
    const result = await validateProviderKey(provider, value);
    setChecking(null);

    if (!result.ok) {
      toast.error("That key was rejected by the provider. Double-check it and try again.");
      return;
    }

    setProviderKey(provider, value);
    clearAvailabilityCache();
    setDrafts((d) => ({ ...d, [provider]: "" }));
    refresh();
    toast.success(`${KEY_PROVIDERS.find((p) => p.id === provider)?.name} connected`);
  };

  const disconnect = (provider: KeyProvider) => {
    setProviderKey(provider, null);
    clearAvailabilityCache();
    refresh();
    toast.success("Key removed from this device");
  };

  const licensedVersions = TRANSLATIONS.filter((t) => t.provider === "youversion");

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>

        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Translation licensing</h1>
          <p className="text-muted-foreground">
            Connect your own publisher keys to unlock NKJV, NLT, ESV, Good News and more — instantly.
          </p>
        </div>

        <Card className="glass-card p-4 mb-6 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Keys are stored on this device only. They are sent with a request just long enough to fetch the
            passage you asked for, and are never saved on our servers.
          </p>
        </Card>

        <div className="space-y-4 mb-10">
          {KEY_PROVIDERS.map((provider) => {
            const connected = Boolean(keys[provider.id]);
            return (
              <Card key={provider.id} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-display font-semibold">{provider.name}</h2>
                      {connected && (
                        <Badge className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Unlocks {provider.unlocks}</p>
                    <p className="text-xs text-muted-foreground mb-3">{provider.help}</p>

                    {connected ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => disconnect(provider.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Remove key
                        </Button>
                        <a href={provider.signupUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm">
                            Manage <ExternalLink className="h-3.5 w-3.5 ml-2" />
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="password"
                          autoComplete="off"
                          placeholder={provider.placeholder}
                          value={drafts[provider.id] || ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [provider.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => connect(provider.id)}
                            disabled={checking === provider.id}
                            className="bg-gradient-to-r from-primary to-primary-glow"
                          >
                            {checking === provider.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" /> Connect
                              </>
                            )}
                          </Button>
                          <a href={provider.signupUrl} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" aria-label="Get a key">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {keys.apibible && (
          <>
            <h2 className="font-display font-semibold mb-2">API.Bible version ids</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the Bible id your API.Bible account is licensed for next to the version it belongs to.
            </p>
            <Card className="glass-card p-5 mb-10 space-y-3">
              {["gnt", "nkjv", "nlt", "esv", "csb", "nasb"].map((id) => {
                const meta = TRANSLATIONS.find((t) => t.id === id)!;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-sm font-semibold">{meta.abbrev}</span>
                    <Input
                      placeholder="Bible id (e.g. de4e12af7f28f599-02)"
                      defaultValue={ids[id] || ""}
                      onBlur={(e) => {
                        setApiBibleId(id, e.target.value || null);
                        clearAvailabilityCache();
                        refresh();
                      }}
                    />
                  </div>
                );
              })}
            </Card>
          </>
        )}

        <Separator className="mb-6" />

        <h2 className="font-display font-semibold mb-3">Licensed versions status</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {licensedVersions.map((t) => {
            const unlocked = unlockedByKeys.has(t.id) || available.has(t.id);
            return (
              <Card key={t.id} className="glass-card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t.abbrev}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.name}</p>
                </div>
                <Badge variant={unlocked ? "default" : "secondary"} className="shrink-0">
                  {unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
