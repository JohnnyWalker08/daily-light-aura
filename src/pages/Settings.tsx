import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Type, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DEFAULT_SETTINGS,
  getUserSettings,
  saveUserSettings,
  type BibleTranslation,
  type ReaderFontFamily,
  type ReaderFontSize,
} from "@/lib/settingsStorage";

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => getUserSettings());

  useEffect(() => {
    setSettings(getUserSettings());
  }, []);

  const translationLabel = useMemo(() => {
    const map: Record<BibleTranslation, string> = {
      kjv: "KJV (Default)",
      web: "WEB",
      asv: "ASV",
    };
    return map[settings.translation];
  }, [settings.translation]);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveUserSettings(next);
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveUserSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link
            to="/more"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        <h1 className="text-3xl font-display font-bold mb-6">Settings</h1>

        <Card className="glass-card p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold">Reading style</h2>
              <p className="text-sm text-muted-foreground">Make the text comfortable for your eyes.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium">Font size</p>
              <Select
                value={settings.fontSize}
                onValueChange={(v) => update({ fontSize: v as ReaderFontSize })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium">Font</p>
              <Select
                value={settings.fontFamily}
                onValueChange={(v) => update({ fontFamily: v as ReaderFontFamily })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="serif">Serif (Book-like)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <p
                className="leading-relaxed"
                style={{
                  fontSize:
                    settings.fontSize === "large"
                      ? 19
                      : settings.fontSize === "xlarge"
                        ? 21
                        : 17,
                  fontFamily: settings.fontFamily === "serif" ? "Georgia, ui-serif, serif" : undefined,
                }}
              >
                “Thy word is a lamp unto my feet, and a light unto my path.”
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold">Bible translation</h2>
              <p className="text-sm text-muted-foreground">
                Pick your preferred translation (more will be added over time).
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Current: {translationLabel}</p>
            <Select
              value={settings.translation}
              onValueChange={(v) => update({ translation: v as BibleTranslation })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kjv">KJV</SelectItem>
                <SelectItem value="web">WEB</SelectItem>
                <SelectItem value="asv">ASV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="flex-1">
            Reset to default
          </Button>
        </div>
      </div>
    </div>
  );
}
