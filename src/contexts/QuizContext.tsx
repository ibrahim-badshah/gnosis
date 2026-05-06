import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface QuizResult {
  date: string;
  score: number;
  total: number;
  category: string;
  wrongTermIds: string[];
}

interface QuizCtx {
  history: QuizResult[];
  addResult: (r: QuizResult) => void;
  getWeakCategories: () => { category: string; wrongCount: number; totalCount: number }[];
  getWeakTerms: () => { termId: string; wrongCount: number }[];
  totalQuizzes: number;
  averageScore: number;
}

const QuizContext = createContext<QuizCtx>({
  history: [], addResult: () => {}, getWeakCategories: () => [],
  getWeakTerms: () => [], totalQuizzes: 0, averageScore: 0
});

export function QuizProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `gnosis-quiz-${user.id}` : 'gnosis-quiz-guest';

  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history));
  }, [history, storageKey]);

  const addResult = (r: QuizResult) => setHistory(prev => [...prev, r]);

  const getWeakCategories = () => {
    const cats: Record<string, { wrong: number; total: number }> = {};
    history.forEach(r => {
      if (!cats[r.category]) cats[r.category] = { wrong: 0, total: 0 };
      cats[r.category].wrong += r.wrongTermIds.length;
      cats[r.category].total += r.total;
    });
    return Object.entries(cats).map(([category, { wrong, total }]) => ({
      category, wrongCount: wrong, totalCount: total
    })).sort((a, b) => (b.wrongCount / b.totalCount) - (a.wrongCount / a.totalCount));
  };

  const getWeakTerms = () => {
    const terms: Record<string, number> = {};
    history.forEach(r => r.wrongTermIds.forEach(id => { terms[id] = (terms[id] || 0) + 1; }));
    return Object.entries(terms).map(([termId, wrongCount]) => ({ termId, wrongCount }))
      .sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 20);
  };

  const totalQuizzes = history.length;
  const averageScore = history.length > 0
    ? Math.round(history.reduce((s, r) => s + (r.score / r.total) * 100, 0) / history.length)
    : 0;

  return (
    <QuizContext.Provider value={{ history, addResult, getWeakCategories, getWeakTerms, totalQuizzes, averageScore }}>
      {children}
    </QuizContext.Provider>
  );
}

export const useQuiz = () => useContext(QuizContext);
