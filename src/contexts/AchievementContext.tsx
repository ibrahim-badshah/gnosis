import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (stats: AchStats) => boolean;
  tier: number;          // 0=root, 1, 2, 3 (depth in tree)
  parentId: string | null; // prerequisite achievement
  branch: 'explore' | 'quiz' | 'bookmark' | 'streak' | 'master';
}

export interface AchStats { explored: number; quizzes: number; bookmarks: number; streak: number; }

export const ACHIEVEMENTS: Achievement[] = [
  // ── Exploration Branch ──
  { id: 'first-word',    name: 'First Step',      icon: '◎', description: 'Explore your first word',    condition: s => s.explored >= 1,   tier: 0, parentId: null,          branch: 'explore' },
  { id: 'explorer-10',   name: 'Explorer',         icon: '◆', description: 'Explore 10 words',           condition: s => s.explored >= 10,  tier: 1, parentId: 'first-word',   branch: 'explore' },
  { id: 'explorer-25',   name: 'Pathfinder',       icon: '◇', description: 'Explore 25 words',           condition: s => s.explored >= 25,  tier: 2, parentId: 'explorer-10',  branch: 'explore' },
  { id: 'explorer-50',   name: 'Adventurer',       icon: '⬡', description: 'Explore 50 words',           condition: s => s.explored >= 50,  tier: 2, parentId: 'explorer-25',  branch: 'explore' },
  { id: 'explorer-100',  name: 'Scholar',          icon: '★', description: 'Explore 100 words',          condition: s => s.explored >= 100, tier: 3, parentId: 'explorer-50',  branch: 'explore' },

  // ── Quiz Branch ──
  { id: 'quiz-first',    name: 'Quiz Taker',       icon: '✓', description: 'Complete your first quiz',   condition: s => s.quizzes >= 1,    tier: 0, parentId: null,           branch: 'quiz' },
  { id: 'quiz-5',        name: 'Quiz Regular',     icon: '✧', description: 'Complete 5 quizzes',         condition: s => s.quizzes >= 5,    tier: 1, parentId: 'quiz-first',   branch: 'quiz' },
  { id: 'quiz-10',       name: 'Quiz Veteran',     icon: '✦', description: 'Complete 10 quizzes',        condition: s => s.quizzes >= 10,   tier: 2, parentId: 'quiz-5',       branch: 'quiz' },
  { id: 'quiz-25',       name: 'Quiz Master',      icon: '✪', description: 'Complete 25 quizzes',        condition: s => s.quizzes >= 25,   tier: 3, parentId: 'quiz-10',      branch: 'quiz' },

  // ── Bookmark Branch ──
  { id: 'bookmark-1',    name: 'Marker',           icon: '▪', description: 'Bookmark your first word',   condition: s => s.bookmarks >= 1,  tier: 0, parentId: null,           branch: 'bookmark' },
  { id: 'bookmark-5',    name: 'Collector',        icon: '▫', description: 'Bookmark 5 words',           condition: s => s.bookmarks >= 5,  tier: 1, parentId: 'bookmark-1',   branch: 'bookmark' },
  { id: 'bookmark-15',   name: 'Curator',          icon: '▸', description: 'Bookmark 15 words',          condition: s => s.bookmarks >= 15, tier: 2, parentId: 'bookmark-5',   branch: 'bookmark' },
  { id: 'bookmark-30',   name: 'Librarian',        icon: '▹', description: 'Bookmark 30 words',          condition: s => s.bookmarks >= 30, tier: 3, parentId: 'bookmark-15',  branch: 'bookmark' },

  // ── Streak Branch ──
  { id: 'streak-2',      name: 'Returner',         icon: '▲', description: '2-day streak',               condition: s => s.streak >= 2,     tier: 0, parentId: null,           branch: 'streak' },
  { id: 'streak-3',      name: 'Consistent',       icon: '△', description: '3-day streak',               condition: s => s.streak >= 3,     tier: 1, parentId: 'streak-2',     branch: 'streak' },
  { id: 'streak-7',      name: 'Dedicated',        icon: '◈', description: '7-day streak',               condition: s => s.streak >= 7,     tier: 2, parentId: 'streak-3',     branch: 'streak' },
  { id: 'streak-14',     name: 'Relentless',       icon: '◉', description: '14-day streak',              condition: s => s.streak >= 14,    tier: 3, parentId: 'streak-7',     branch: 'streak' },

  // ── Mastery Branch (cross-category) ──
  { id: 'well-rounded',  name: 'Well Rounded',     icon: '●', description: 'Explore 10 + Quiz 3 + Bookmark 3', condition: s => s.explored >= 10 && s.quizzes >= 3 && s.bookmarks >= 3, tier: 1, parentId: null, branch: 'master' },
  { id: 'completionist', name: 'Completionist',    icon: '◆', description: 'Explore 50 + Quiz 10 + Streak 5',  condition: s => s.explored >= 50 && s.quizzes >= 10 && s.streak >= 5,  tier: 2, parentId: 'well-rounded', branch: 'master' },
  { id: 'gnosis-master', name: 'Gnosis Master',    icon: '✶', description: 'Explore 100 + Quiz 25 + Streak 7', condition: s => s.explored >= 100 && s.quizzes >= 25 && s.streak >= 7, tier: 3, parentId: 'completionist', branch: 'master' },
];

interface AchCtx {
  unlocked: string[];
  achievements: (Achievement & { unlocked: boolean })[];
  checkAchievements: (stats: AchStats) => string[];
}

const AchievementContext = createContext<AchCtx>({ unlocked: [], achievements: [], checkAchievements: () => [] });

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `gnosis-achievements-${user.id}` : 'gnosis-achievements-guest';

  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setUnlocked(data);
    } catch {
      setUnlocked([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(unlocked));
  }, [unlocked, storageKey]);

  const checkAchievements = (stats: AchStats) => {
    const newlyUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(a => {
      if (!unlocked.includes(a.id) && a.condition(stats)) {
        newlyUnlocked.push(a.id);
      }
    });
    if (newlyUnlocked.length > 0) {
      setUnlocked(prev => [...prev, ...newlyUnlocked]);
    }
    return newlyUnlocked;
  };

  const achievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));

  return (
    <AchievementContext.Provider value={{ unlocked, achievements, checkAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
}

export const useAchievements = () => useContext(AchievementContext);
