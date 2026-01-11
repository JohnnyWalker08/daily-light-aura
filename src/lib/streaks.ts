import { getProgress } from "./progressStorage";

export type StreakBadge = {
  name: string;
  description: string;
};

export function computeStreakBadges(currentStreak: number): StreakBadge | null {
  if (currentStreak >= 30) {
    return { name: "Radiant", description: "30-day streak — you’re building a holy rhythm." };
  }
  if (currentStreak >= 14) {
    return { name: "Steadfast", description: "14-day streak — keep the flame burning." };
  }
  if (currentStreak >= 7) {
    return { name: "Consistent", description: "7-day streak — a full week in the Word." };
  }
  if (currentStreak >= 3) {
    return { name: "Growing", description: "3-day streak — momentum is forming." };
  }
  return null;
}

export function getStreakStats(): {
  current: number;
  best: number;
  badge: StreakBadge | null;
  lastActiveDay: string | null;
} {
  const progress = getProgress();
  const set = new Set(progress.readDates || []);

  if (set.size === 0) {
    return { current: 0, best: 0, badge: null, lastActiveDay: null };
  }

  const days = Array.from(set).sort();

  const today = new Date();
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);

  // Current streak (today backward)
  let current = 0;
  for (let i = 0; i < 3650; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (set.has(dayKey(d))) current++;
    else break;
  }

  // Best streak (scan sorted list)
  const toDate = (k: string) => new Date(`${k}T00:00:00Z`);
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = toDate(days[i - 1]);
    const cur = toDate(days[i]);
    const diff = (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  const badge = computeStreakBadges(current);
  return {
    current,
    best,
    badge,
    lastActiveDay: days[days.length - 1] || null,
  };
}
