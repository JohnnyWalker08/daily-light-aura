// Reading Progress storage using localStorage
import { BOOK_CHAPTERS } from './offlineBible';

export interface ReadingProgress {
  chaptersRead: { [key: string]: boolean }; // "Genesis_1": true
  readDates: string[]; // YYYY-MM-DD strings for streak tracking
  lastReadDate: string | null;
  lastReadBook: string | null;
  lastReadChapter: number | null;
}

const STORAGE_KEY = 'reading_progress';

function toDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getProgress(): ReadingProgress {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as ReadingProgress;
    return {
      chaptersRead: parsed.chaptersRead || {},
      readDates: parsed.readDates || [],
      lastReadDate: parsed.lastReadDate ?? null,
      lastReadBook: parsed.lastReadBook ?? null,
      lastReadChapter: parsed.lastReadChapter ?? null,
    };
  }
  return {
    chaptersRead: {},
    readDates: [],
    lastReadDate: null,
    lastReadBook: null,
    lastReadChapter: null,
  };
}

export function saveProgress(progress: ReadingProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markChapterAsRead(book: string, chapter: number): void {
  const progress = getProgress();
  const key = `${book}_${chapter}`;
  progress.chaptersRead[key] = true;

  const today = toDayKey();
  if (!progress.readDates.includes(today)) {
    progress.readDates.push(today);
  }

  progress.lastReadDate = new Date().toISOString();
  progress.lastReadBook = book;
  progress.lastReadChapter = chapter;
  saveProgress(progress);
}

export function markChapterAsUnread(book: string, chapter: number): void {
  const progress = getProgress();
  const key = `${book}_${chapter}`;
  delete progress.chaptersRead[key];
  saveProgress(progress);
}

export function isChapterRead(book: string, chapter: number): boolean {
  const progress = getProgress();
  return progress.chaptersRead[`${book}_${chapter}`] === true;
}

export function getBookProgress(book: string): { read: number; total: number; percentage: number } {
  const progress = getProgress();
  const totalChapters = BOOK_CHAPTERS[book] || 0;
  let readCount = 0;
  
  for (let i = 1; i <= totalChapters; i++) {
    if (progress.chaptersRead[`${book}_${i}`]) {
      readCount++;
    }
  }
  
  return {
    read: readCount,
    total: totalChapters,
    percentage: totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0,
  };
}

export function getTotalProgress(): {
  chaptersRead: number;
  totalChapters: number;
  percentage: number;
  booksStarted: number;
  booksCompleted: number;
} {
  const progress = getProgress();
  const books = Object.keys(BOOK_CHAPTERS);
  
  let totalChapters = 0;
  let chaptersRead = 0;
  let booksStarted = 0;
  let booksCompleted = 0;
  
  books.forEach(book => {
    const bookTotal = BOOK_CHAPTERS[book];
    totalChapters += bookTotal;
    
    let bookRead = 0;
    for (let i = 1; i <= bookTotal; i++) {
      if (progress.chaptersRead[`${book}_${i}`]) {
        bookRead++;
        chaptersRead++;
      }
    }
    
    if (bookRead > 0) booksStarted++;
    if (bookRead === bookTotal) booksCompleted++;
  });
  
  return {
    chaptersRead,
    totalChapters,
    percentage: Math.round((chaptersRead / totalChapters) * 100),
    booksStarted,
    booksCompleted,
  };
}

export function getLastRead(): { book: string; chapter: number; date: string } | null {
  const progress = getProgress();
  if (progress.lastReadBook && progress.lastReadChapter && progress.lastReadDate) {
    return {
      book: progress.lastReadBook,
      chapter: progress.lastReadChapter,
      date: progress.lastReadDate,
    };
  }
  return null;
}
