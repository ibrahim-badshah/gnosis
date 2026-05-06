import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'sepia' | 'light' | 'dark';
interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', setTheme: () => {} });

function getInitialTheme(): Theme {
  // One-time migration: switch old default (sepia) to dark
  const migrated = localStorage.getItem('gnosis-theme-migrated-v2');
  if (!migrated) {
    localStorage.setItem('gnosis-theme-migrated-v2', '1');
    localStorage.setItem('gnosis-theme', 'dark');
    return 'dark';
  }
  return (localStorage.getItem('gnosis-theme') as Theme) || 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'sepia' ? '' : theme);
    localStorage.setItem('gnosis-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
