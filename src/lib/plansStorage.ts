// Reading Plans storage using localStorage

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  readings: PlanReading[];
  gradient: string;
}

export interface PlanReading {
  day: number;
  passages: string[]; // e.g., ["Genesis 1", "Genesis 2"]
  title: string;
}

export interface UserPlanProgress {
  planId: string;
  startDate: string;
  completedDays: number[];
  currentDay: number;
}

const PLANS_PROGRESS_KEY = 'plans_progress';

// Predefined Reading Plans
export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'bible-in-year',
    title: 'Read the Bible in a Year',
    description: 'Complete the entire Bible with daily readings that fit your schedule',
    totalDays: 365,
    gradient: 'from-primary to-primary-glow',
    readings: generateBibleInYearPlan(),
  },
  {
    id: 'psalms-30',
    title: '30-Day Psalms Journey',
    description: 'Explore the Psalms over 30 days of reflection and worship',
    totalDays: 30,
    gradient: 'from-blue-500 to-cyan-400',
    readings: generatePsalms30Plan(),
  },
  {
    id: 'gospels-90',
    title: 'Gospels in 90 Days',
    description: 'Walk with Jesus through Matthew, Mark, Luke, and John',
    totalDays: 90,
    gradient: 'from-amber-500 to-orange-400',
    readings: generateGospels90Plan(),
  },
];

function generateBibleInYearPlan(): PlanReading[] {
  // Simplified plan - 3-4 chapters per day
  const readings: PlanReading[] = [];
  const books = [
    { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 },
    { name: 'Leviticus', chapters: 27 }, { name: 'Numbers', chapters: 36 },
    { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 },
    { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 },
    { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 },
    { name: 'Ezra', chapters: 10 }, { name: 'Nehemiah', chapters: 13 },
    { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 },
    { name: 'Ecclesiastes', chapters: 12 }, { name: 'Song of Solomon', chapters: 8 },
    { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 }, { name: 'Hosea', chapters: 14 },
    { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 },
    { name: 'Micah', chapters: 7 }, { name: 'Nahum', chapters: 3 },
    { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 },
    { name: 'Malachi', chapters: 4 }, { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 },
    { name: 'Romans', chapters: 16 }, { name: '1 Corinthians', chapters: 16 },
    { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 },
    { name: 'Colossians', chapters: 4 }, { name: '1 Thessalonians', chapters: 5 },
    { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 },
    { name: 'Philemon', chapters: 1 }, { name: 'Hebrews', chapters: 13 },
    { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 },
    { name: '2 John', chapters: 1 }, { name: '3 John', chapters: 1 },
    { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 },
  ];
  
  let day = 1;
  let currentBook = 0;
  let currentChapter = 1;
  
  while (day <= 365 && currentBook < books.length) {
    const passages: string[] = [];
    let chaptersToday = 0;
    const targetChapters = 3;
    
    while (chaptersToday < targetChapters && currentBook < books.length) {
      passages.push(`${books[currentBook].name} ${currentChapter}`);
      chaptersToday++;
      currentChapter++;
      
      if (currentChapter > books[currentBook].chapters) {
        currentBook++;
        currentChapter = 1;
      }
    }
    
    if (passages.length > 0) {
      readings.push({
        day,
        passages,
        title: `Day ${day}`,
      });
      day++;
    }
  }
  
  return readings;
}

function generatePsalms30Plan(): PlanReading[] {
  const readings: PlanReading[] = [];
  for (let day = 1; day <= 30; day++) {
    const psalms: string[] = [];
    // 5 Psalms per day
    for (let i = 0; i < 5; i++) {
      const psalmNum = (day - 1) * 5 + i + 1;
      if (psalmNum <= 150) {
        psalms.push(`Psalms ${psalmNum}`);
      }
    }
    readings.push({
      day,
      passages: psalms,
      title: `Day ${day}: Psalms ${(day - 1) * 5 + 1}-${Math.min(day * 5, 150)}`,
    });
  }
  return readings;
}

function generateGospels90Plan(): PlanReading[] {
  const readings: PlanReading[] = [];
  const gospels = [
    { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 },
  ];
  
  let day = 1;
  for (const gospel of gospels) {
    for (let ch = 1; ch <= gospel.chapters; ch++) {
      readings.push({
        day,
        passages: [`${gospel.name} ${ch}`],
        title: `${gospel.name} ${ch}`,
      });
      day++;
    }
  }
  
  // Pad remaining days with reflections on key passages
  while (readings.length < 90) {
    readings.push({
      day: readings.length + 1,
      passages: [`John ${(readings.length % 21) + 1}`],
      title: `Reflection Day`,
    });
  }
  
  return readings;
}

export function getUserPlanProgress(planId: string): UserPlanProgress | null {
  const stored = localStorage.getItem(PLANS_PROGRESS_KEY);
  if (!stored) return null;
  
  const allProgress: UserPlanProgress[] = JSON.parse(stored);
  return allProgress.find(p => p.planId === planId) || null;
}

export function getAllUserPlansProgress(): UserPlanProgress[] {
  const stored = localStorage.getItem(PLANS_PROGRESS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function startPlan(planId: string): UserPlanProgress {
  const allProgress = getAllUserPlansProgress();
  const existing = allProgress.find(p => p.planId === planId);
  
  if (existing) {
    return existing;
  }
  
  const newProgress: UserPlanProgress = {
    planId,
    startDate: new Date().toISOString(),
    completedDays: [],
    currentDay: 1,
  };
  
  allProgress.push(newProgress);
  localStorage.setItem(PLANS_PROGRESS_KEY, JSON.stringify(allProgress));
  return newProgress;
}

export function markDayComplete(planId: string, day: number): void {
  const allProgress = getAllUserPlansProgress();
  const progress = allProgress.find(p => p.planId === planId);
  
  if (progress) {
    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
    }
    progress.currentDay = Math.max(progress.currentDay, day + 1);
    localStorage.setItem(PLANS_PROGRESS_KEY, JSON.stringify(allProgress));
  }
}

export function resetPlan(planId: string): void {
  const allProgress = getAllUserPlansProgress();
  const index = allProgress.findIndex(p => p.planId === planId);
  
  if (index >= 0) {
    allProgress.splice(index, 1);
    localStorage.setItem(PLANS_PROGRESS_KEY, JSON.stringify(allProgress));
  }
}

export function getTodaysReading(planId: string): PlanReading | null {
  const plan = READING_PLANS.find(p => p.id === planId);
  const progress = getUserPlanProgress(planId);
  
  if (!plan || !progress) return null;
  
  const currentDay = progress.currentDay;
  return plan.readings.find(r => r.day === currentDay) || null;
}

export function getActivePlans(): { plan: ReadingPlan; progress: UserPlanProgress; todaysReading: PlanReading | null }[] {
  const allProgress = getAllUserPlansProgress();
  
  return allProgress.map(progress => {
    const plan = READING_PLANS.find(p => p.id === progress.planId)!;
    const todaysReading = getTodaysReading(progress.planId);
    return { plan, progress, todaysReading };
  }).filter(item => item.plan);
}
