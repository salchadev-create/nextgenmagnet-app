'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const BG_COLORS = [
  { label: 'Beyaz', value: '#ffffff', text: 'text-gray-900' },
  { label: 'Sarı', value: '#fdf6e3', text: 'text-gray-900' },
  { label: 'Yeşil', value: '#f0faf4', text: 'text-gray-900' },
  { label: 'Mavi', value: '#f0f8ff', text: 'text-gray-900' },
];

export { BG_COLORS };

interface ThemeContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
  bgColors: typeof BG_COLORS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'app_bg_color';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgColor, setBgColorState] = useState('#ffffff');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBgColorState(saved);
    }
  }, []);

  const setBgColor = (color: string) => {
    setBgColorState(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, color);
    }
  };

  return (
    <ThemeContext.Provider value={{ bgColor, setBgColor, bgColors: BG_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
