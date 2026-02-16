export type BibleTranslation = "kjv" | "web" | "asv";

export type ReaderFontSize = "default" | "large" | "xlarge";
export type ReaderFontFamily = "default" | "serif" | "lora" | "merriweather" | "literata" | "source-serif" | "crimson";

export interface UserSettings {
  translation: BibleTranslation;
  fontSize: ReaderFontSize;
  fontFamily: ReaderFontFamily;
}

const STORAGE_KEY = "dailylight_settings";

export const DEFAULT_SETTINGS: UserSettings = {
  translation: "kjv",
  fontSize: "default",
  fontFamily: "default",
};

export function getUserSettings(): UserSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      translation: (parsed.translation ?? DEFAULT_SETTINGS.translation) as UserSettings["translation"],
      fontSize: (parsed.fontSize ?? DEFAULT_SETTINGS.fontSize) as UserSettings["fontSize"],
      fontFamily: (parsed.fontFamily ?? DEFAULT_SETTINGS.fontFamily) as UserSettings["fontFamily"],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(next: UserSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("dailylight:settings"));
}

export function applyReaderSettingsToDocument(settings: UserSettings) {
  const root = document.documentElement;

  const fontSizePx =
    settings.fontSize === "large" ? 19 : settings.fontSize === "xlarge" ? 21 : 17;

  root.style.setProperty("--reader-font-size", `${fontSizePx}px`);
  const fontMap: Record<ReaderFontFamily, string> = {
    default: "inherit",
    serif: "Georgia, ui-serif, serif",
    lora: "'Lora', Georgia, serif",
    merriweather: "'Merriweather', Georgia, serif",
    literata: "'Literata', Georgia, serif",
    "source-serif": "'Source Serif 4', Georgia, serif",
    crimson: "'Crimson Text', Georgia, serif",
  };
  root.style.setProperty("--reader-font-family", fontMap[settings.fontFamily] || "inherit");
}

export function onSettingsChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("dailylight:settings", handler);
  return () => window.removeEventListener("dailylight:settings", handler);
}
