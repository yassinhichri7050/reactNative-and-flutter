import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeName, themes, goldLightTheme } from '../theme/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@immobilier_app:theme';

/**
 * Provider de thème
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('gold_light');
  const [theme, setThemeState] = useState<Theme>(goldLightTheme);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme as ThemeName) in themes) {
        const name = savedTheme as ThemeName;
        setThemeName(name);
        setThemeState(themes[name]);
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
  };

  const setTheme = async (name: ThemeName) => {
    try {
      setThemeName(name);
      setThemeState(themes[name]);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const toggleTheme = async () => {
    const themeOrder: ThemeName[] = ['gold_light', 'gold_dark', 'green_nature'];
    const currentIndex = themeOrder.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    await setTheme(themeOrder[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook pour utiliser le thème
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};
