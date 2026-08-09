// Active Reading: reflections, identity cards and reflection streak.
// Stored locally so the whole flow works offline and without an account.

export interface Reflection {
  id: string;
  book: string;
  chapter: number;
  noticed: string;
  question: string;
  understood: string;
  applied: string;
  createdAt: string; // ISO
}

export interface IdentityCard {
  id: string;
  text: string;
  reference: string;
  book: string;
  chapter: number;
  createdAt: string;
}

const REFLECTIONS_KEY = "active_reading_reflections";
const IDENTITY_KEY = "active_reading_identity_cards";
const DRAFT_KEY = "active_reading_draft";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function getReflections(): Reflection[] {
  return read<Reflection>(REFLECTIONS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveReflection(input: Omit<Reflection, "id" | "createdAt">): Reflection {
  const reflection: Reflection = { ...input, id: newId(), createdAt: new Date().toISOString() };
  write(REFLECTIONS_KEY, [...read<Reflection>(REFLECTIONS_KEY), reflection]);
  return reflection;
}

export function deleteReflection(id: string) {
  write(
    REFLECTIONS_KEY,
    read<Reflection>(REFLECTIONS_KEY).filter((r) => r.id !== id)
  );
}

export function getIdentityCards(): IdentityCard[] {
  return read<IdentityCard>(IDENTITY_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveIdentityCard(input: Omit<IdentityCard, "id" | "createdAt">): IdentityCard {
  const card: IdentityCard = { ...input, id: newId(), createdAt: new Date().toISOString() };
  write(IDENTITY_KEY, [...read<IdentityCard>(IDENTITY_KEY), card]);
  return card;
}

export function deleteIdentityCard(id: string) {
  write(
    IDENTITY_KEY,
    read<IdentityCard>(IDENTITY_KEY).filter((c) => c.id !== id)
  );
}

const dayKey = (d: Date | string = new Date()) =>
  (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);

/** Consecutive days (ending today or yesterday) with at least one saved reflection. */
export function getReflectionStreak(): number {
  const days = new Set(getReflections().map((r) => dayKey(r.createdAt)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getTodaysReflections(): Reflection[] {
  const today = dayKey();
  return getReflections().filter((r) => dayKey(r.createdAt) === today);
}

// --- Resume-where-you-left-off draft ---

export interface ReflectionDraft {
  book: string;
  chapter: number;
  step: number;
  noticed: string;
  question: string;
  understood: string;
  applied: string;
}

export function saveDraft(draft: ReflectionDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getDraft(book: string, chapter: number): ReflectionDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as ReflectionDraft;
    return draft.book === book && draft.chapter === chapter ? draft : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
