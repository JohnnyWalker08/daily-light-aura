// Notes & Reflections storage using IndexedDB
const DB_NAME = 'BibleNotesDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

export interface Note {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('book', 'book', { unique: false });
        store.createIndex('reference', ['book', 'chapter', 'verse'], { unique: false });
      }
    };
  });
}

export async function saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const db = await openDB();
  const now = new Date().toISOString();
  const newNote: Note = {
    ...note,
    id: `${note.book}_${note.chapter}_${note.verse || 'chapter'}_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(newNote);
    request.onsuccess = () => resolve(newNote);
    request.onerror = () => reject(request.error);
  });
}

export async function updateNote(id: string, content: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const note = getRequest.result;
      if (note) {
        note.content = content;
        note.updatedAt = new Date().toISOString();
        const putRequest = store.put(note);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Note not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteNote(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getNotesForChapter(book: string, chapter: number): Promise<Note[]> {
  const notes = await getAllNotes();
  return notes.filter(n => n.book === book && n.chapter === chapter);
}

export async function hasNoteForVerse(book: string, chapter: number, verse: number): Promise<boolean> {
  const notes = await getNotesForChapter(book, chapter);
  return notes.some(n => n.verse === verse);
}

export async function hasNoteForChapter(book: string, chapter: number): Promise<boolean> {
  const notes = await getNotesForChapter(book, chapter);
  return notes.some(n => !n.verse);
}
