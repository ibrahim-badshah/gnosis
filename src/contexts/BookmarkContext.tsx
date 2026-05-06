import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface BookmarkCtx {
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkCtx>({ bookmarks: [], toggleBookmark: () => {}, isBookmarked: () => false });

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `gnosis-bookmarks-${user.id}` : 'gnosis-bookmarks-guest';

  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>{children}</BookmarkContext.Provider>;
}

export const useBookmarks = () => useContext(BookmarkContext);
