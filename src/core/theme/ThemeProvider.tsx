import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Separate theme objects for clarity
export const lightTheme: Theme & { colors: { placeholder: string } } = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#222222',
    border: '#e0e0e0',
    notification: '#ff4d4f',
    placeholder: '#888888',
  },
};

export const darkTheme: Theme & { colors: { placeholder: string } } = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#90caf9',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#272727',
    notification: '#ff4d4f',
    placeholder: '#AAAAAA',
  },
};

type ThemeContextType = {
  theme: typeof lightTheme; // ensures placeholder exists
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_KEY = 'APP_THEME';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [manualDark, setManualDark] = useState<boolean | null>(null);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved !== null) {
        setManualDark(saved === 'dark');
      }
    });
  }, []);

  // Save whenever changed manually
  useEffect(() => {
    if (manualDark !== null) {
      AsyncStorage.setItem(THEME_KEY, manualDark ? 'dark' : 'light').catch(e =>
        console.log('Theme save failed:', e),
      );
    }
  }, [manualDark]);

  const isDark = manualDark !== null ? manualDark : systemScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setManualDark(prev => (prev === null ? !isDark : !prev));

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Hook for easy use
export const useThemeProvider = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeProvider must be used inside ThemeProvider');
  return ctx;
};