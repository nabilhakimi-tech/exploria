import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── XP & Leveling System ────────────────────────────────────────────────────
// Formula: Level N requires N × 100 XP total
// Level 1 = 0 XP, Level 2 = 200 XP, Level 3 = 300 XP, etc.

/** Calculate level from total XP */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  // Level N requires N * 100 cumulative XP
  // Sum of (i * 100) for i=2..N = 100 * (N*(N+1)/2 - 1)
  // Simplified: find largest N where N*100 <= xp
  let level = 1;
  let cumulativeXp = 0;
  while (cumulativeXp + (level + 1) * 100 <= xp) {
    level++;
    cumulativeXp += level * 100;
  }
  return level;
}

/** XP required to reach the next level from current level */
export function xpForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * 100;
}

/** XP progress within current level (0 to 1) */
export function xpProgress(xp: number, currentLevel: number): number {
  let cumulativeXp = 0;
  for (let i = 2; i <= currentLevel; i++) {
    cumulativeXp += i * 100;
  }
  const xpInCurrentLevel = xp - cumulativeXp;
  const xpNeeded = xpForNextLevel(currentLevel);
  return Math.min(Math.max(xpInCurrentLevel / xpNeeded, 0), 1);
}

// ─── Grade Structure Constants ───────────────────────────────────────────────

export const SK_GRADES = [
  'Darjah 1',
  'Darjah 2',
  'Darjah 3',
  'Darjah 4',
  'Darjah 5',
  'Darjah 6',
] as const;

export const SMK_GRADES = [
  'Tingkatan 1',
  'Tingkatan 2',
  'Tingkatan 3',
  'Tingkatan 4',
  'Tingkatan 5',
] as const;

export type SchoolType = 'SK' | 'SMK';
export type SKGrade = (typeof SK_GRADES)[number];
export type SMKGrade = (typeof SMK_GRADES)[number];
export type Grade = SKGrade | SMKGrade;
