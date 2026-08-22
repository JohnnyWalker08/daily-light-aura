// Saved verses, stored per translation so you always see the wording you read.

export interface BookmarkedVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  createdAt: string;
}

const KEY = "bookmarks";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/** Older versions stored `{ reference, text }` only — treat those as KJV. */
function normalise(raw: any): BookmarkedVerse | null {
  if (!raw?.reference || typeof raw.text !== "string") return null;
  return {
    id: raw.id || newId(),
    reference: String(raw.reference),
    text: raw.text,
    translation: raw.translation || "kjv",
    createdAt: raw.createdAt || new Date(0).toISOString(),
  };
}

export function getBookmarks(): BookmarkedVerse[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map(normalise).filter(Boolean) as BookmarkedVerse[];
  } catch {
    return [];
  }
}

function write(list: BookmarkedVerse[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addBookmark(input: { reference: string; text: string; translation: string }): BookmarkedVerse {
  const list = getBookmarks();
  const existing = list.find(
    (b) => b.reference === input.reference && b.translation === input.translation
  );
  if (existing) return existing;

  const bookmark: BookmarkedVerse = { ...input, id: newId(), createdAt: new Date().toISOString() };
  write([bookmark, ...list]);
  return bookmark;
}

export function removeBookmark(id: string) {
  write(getBookmarks().filter((b) => b.id !== id));
}

/** Translation ids that appear in the saved verses, for filter chips. */
export function bookmarkTranslations(): string[] {
  return Array.from(new Set(getBookmarks().map((b) => b.translation)));
}
