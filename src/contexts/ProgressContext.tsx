import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { allTerms } from '../data/dictionary';
import { useAuth } from './AuthContext';

interface ProgressCtx {
  explored: string[];
  markExplored: (id: string) => void;
  isExplored: (id: string) => boolean;
  exploredCount: number;
  totalCount: number;
  percentage: number;
  wordOfTheDay: string | null;
}

const ProgressContext = createContext<ProgressCtx>({
  explored: [], markExplored: () => {}, isExplored: () => false,
  exploredCount: 0, totalCount: 0, percentage: 0, wordOfTheDay: null
});

function getDailyWord(explored: string[]): string | null {
  const unexplored = allTerms.filter(t => !explored.includes(t.id));
  if (unexplored.length === 0) return allTerms[0]?.id || null;
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return unexplored[seed % unexplored.length].id;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `gnosis-explored-${user.id}` : 'gnosis-explored-guest';

  const [explored, setExplored] = useState<string[]>([]);

  // Load on mount or user change
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setExplored(data);
    } catch {
      setExplored([]);
    }
  }, [storageKey]);

  // Save on explored change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(explored));
  }, [explored, storageKey]);

  const markExplored = (id: string) => {
    setExplored(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const wordOfTheDay = getDailyWord(explored);

  return (
    <ProgressContext.Provider value={{
      explored, markExplored, isExplored: (id) => explored.includes(id),
      exploredCount: explored.length, totalCount: allTerms.length,
      percentage: Math.round((explored.length / allTerms.length) * 100),
      wordOfTheDay
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
