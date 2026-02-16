import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Settings2, X, Moon, Sun } from "lucide-react";
import {
  getUserSettings,
  saveUserSettings,
  applyReaderSettingsToDocument,
  type ReaderFontFamily,
  type ReaderFontSize,
} from "@/lib/settingsStorage";

const FONTS: { value: ReaderFontFamily; label: string; style: string }[] = [
  { value: "default", label: "Inter", style: "inherit" },
  { value: "serif", label: "Georgia", style: "Georgia, ui-serif, serif" },
  { value: "lora", label: "Lora", style: "'Lora', Georgia, serif" },
  { value: "merriweather", label: "Merriweather", style: "'Merriweather', Georgia, serif" },
  { value: "literata", label: "Literata", style: "'Literata', Georgia, serif" },
  { value: "source-serif", label: "Source Serif", style: "'Source Serif 4', Georgia, serif" },
  { value: "crimson", label: "Crimson", style: "'Crimson Text', Georgia, serif" },
];

const FONT_SIZES: { value: ReaderFontSize; label: string; size: number }[] = [
  { value: "default", label: "Default", size: 17 },
  { value: "large", label: "Large", size: 19 },
  { value: "xlarge", label: "XL", size: 21 },
];

// Line height options
const LINE_HEIGHTS = [1.5, 1.75, 2.0, 2.25];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ReaderSettingsPanel({ isOpen, onClose }: Props) {
  const [settings, setSettings] = useState(() => getUserSettings());
  const [lineHeight, setLineHeight] = useState(1.75);
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    setSettings(getUserSettings());
  }, [isOpen]);

  const updateSettings = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveUserSettings(next);
    applyReaderSettingsToDocument(next);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(!isDark);
  };

  const handleLineHeightChange = (value: number[]) => {
    const lh = value[0];
    setLineHeight(lh);
    document.documentElement.style.setProperty("--reader-line-height", String(lh));
  };

  const fontSizeIndex = FONT_SIZES.findIndex((f) => f.value === settings.fontSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-fade-in-up">
      <Card className="glass-card max-w-lg mx-auto p-5 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Reading Settings</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Font Family Selection */}
        <div className="mb-5">
          <p className="text-sm text-muted-foreground mb-2">Font</p>
          <div className="flex flex-wrap gap-2">
            {FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => updateSettings({ fontFamily: font.value })}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  settings.fontFamily === font.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                style={{ fontFamily: font.style }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Font Size</p>
            <span className="text-xs text-muted-foreground">
              {FONT_SIZES[fontSizeIndex]?.label || "Default"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Aa</span>
            <Slider
              value={[fontSizeIndex >= 0 ? fontSizeIndex : 0]}
              min={0}
              max={FONT_SIZES.length - 1}
              step={1}
              onValueChange={(v) => updateSettings({ fontSize: FONT_SIZES[v[0]].value })}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-muted-foreground">Aa</span>
          </div>
        </div>

        {/* Line Height Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Line Spacing</p>
            <span className="text-xs text-muted-foreground">{lineHeight.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            <Slider
              value={[lineHeight]}
              min={1.5}
              max={2.25}
              step={0.25}
              onValueChange={handleLineHeightChange}
              className="flex-1"
            />
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="20" y2="4" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="20" x2="20" y2="20" />
            </svg>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">Theme</p>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
