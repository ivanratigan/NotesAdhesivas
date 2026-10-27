"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

type ContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const initialValue: ContextType = {
  theme: Theme.LIGHT,
  toggleTheme: () => {},
};

const ThemeContext = createContext<ContextType>(initialValue);

const THEME_STORAGE_KEY = "clase3-theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === Theme.DARK || saved === Theme.LIGHT) {
        setTheme(saved as Theme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme(Theme.DARK);
      }
    } catch {
      // Ignorar si no hay acceso a storage
    }
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignorar
      }
      return next;
    });
  }

  const value = useMemo(() => {
    return {
      theme,
      toggleTheme,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ContextType => useContext(ThemeContext);
