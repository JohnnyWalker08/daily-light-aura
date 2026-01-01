// Verse highlighting storage using localStorage

export interface VerseHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string; name: string }[] = [
  { color: 'yellow', bg: 'bg-yellow-200/40 dark:bg-yellow-400/20', name: 'Yellow' },
  { color: 'green', bg: 'bg-green-200/40 dark:bg-green-400/20', name: 'Green' },
  { color: 'blue', bg: 'bg-blue-200/40 dark:bg-blue-400/20', name: 'Blue' },
  { color: 'pink', bg: 'bg-pink-200/40 dark:bg-pink-400/20', name: 'Pink' },
  { color: 'purple', bg: 'bg-purple-200/40 dark:bg-purple-400/20', name: 'Purple' },
];

const HIGHLIGHTS_KEY = 'verse_highlights';

export function getAllHighlights(): VerseHighlight[] {
  const stored = localStorage.getItem(HIGHLIGHTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getHighlightsForChapter(book: string, chapter: number): VerseHighlight[] {
  return getAllHighlights().filter(h => h.book === book && h.chapter === chapter);
}

export function getHighlightForVerse(book: string, chapter: number, verse: number): VerseHighlight | undefined {
  return getAllHighlights().find(h => h.book === book && h.chapter === chapter && h.verse === verse);
}

export function highlightVerse(book: string, chapter: number, verse: number, color: HighlightColor): VerseHighlight {
  const highlights = getAllHighlights();
  const existingIndex = highlights.findIndex(h => h.book === book && h.chapter === chapter && h.verse === verse);
  
  const highlight: VerseHighlight = {
    id: existingIndex >= 0 ? highlights[existingIndex].id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    book,
    chapter,
    verse,
    color,
    createdAt: existingIndex >= 0 ? highlights[existingIndex].createdAt : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    highlights[existingIndex] = highlight;
  } else {
    highlights.push(highlight);
  }

  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  return highlight;
}

export function removeHighlight(book: string, chapter: number, verse: number): void {
  const highlights = getAllHighlights().filter(
    h => !(h.book === book && h.chapter === chapter && h.verse === verse)
  );
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
}
