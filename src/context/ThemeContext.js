import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, getCategoryColors } from '../theme';

const ThemeContext = createContext(null);

// Default is dark ("Pink + Black") to match how the app looked before this
// toggle existed — so a first-time install doesn't feel different.
const DEFAULT_THEME_NAME = 'dark';

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(DEFAULT_THEME_NAME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('cs_theme');
        if (stored === 'light' || stored === 'dark') setThemeName(stored);
      } catch (e) {
        console.log('[Theme] Could not load stored theme:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setTheme = async (name) => {
    setThemeName(name);
    try {
      await AsyncStorage.setItem('cs_theme', name);
    } catch (e) {
      console.log('[Theme] Could not save theme:', e);
    }
  };

  const toggleTheme = () => setTheme(themeName === 'dark' ? 'light' : 'dark');

  const active = themeName === 'light' ? lightTheme : darkTheme;
  const CATEGORY_COLORS = getCategoryColors(active.COLORS);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        isDark: themeName === 'dark',
        COLORS: active.COLORS,
        SHADOWS: active.SHADOWS,
        CATEGORY_COLORS,
        toggleTheme,
        setTheme,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
