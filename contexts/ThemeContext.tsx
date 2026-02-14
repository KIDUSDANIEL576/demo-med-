
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Theme = 'default' | 'christmas';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string | null;
  setPrimaryColor: (color: string | null) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('default');
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    if (theme === 'christmas') {
        // Reset custom color if a theme is chosen
        setPrimaryColor(null);
    }
  }

  return (
    <ThemeContext.Provider value={{ 
        theme, 
        setTheme, 
        primaryColor, 
        setPrimaryColor, 
        logoUrl, 
        setLogoUrl, 
        backgroundUrl, 
        setBackgroundUrl 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
