/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { getSafeLocalStorage, readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';
import { getMediaQueryList, subscribeMediaQuery } from '../platform/browser/mediaQuery';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light', // Light is default as per our Startup UX rule
  resolvedTheme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = STORAGE_KEYS.theme,
  ...props
}: ThemeProviderProps) {
  const safeLocalStorage = getSafeLocalStorage();
  const [theme, setTheme] = useState<Theme>(
    () => (safeLocalStorage ? (readStorageValue(safeLocalStorage, storageKey) as Theme) : null) || defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = getMediaQueryList('(prefers-color-scheme: dark)');
    const applyTheme = (nextTheme: Theme) => {
      root.classList.remove('light', 'dark');

      const effectiveTheme =
        nextTheme === 'system'
          ? (mediaQuery?.matches ? 'dark' : 'light')
          : nextTheme;

      root.classList.add(effectiveTheme);
      setResolvedTheme(effectiveTheme);
    };

    applyTheme(theme);

    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    const unsubscribe = subscribeMediaQuery(mediaQuery, handleSystemThemeChange);
    return unsubscribe;
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      if (safeLocalStorage) {
        writeStorageValue(safeLocalStorage, storageKey, theme);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Custom hook to use theme anywhere in the app
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
