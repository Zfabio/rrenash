import { createContext, useContext, useState, ReactNode } from 'react';

export type CardTheme = 'classic' | 'eagle';

interface ThemeContextType {
  cardTheme: CardTheme;
  setCardTheme: (theme: CardTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
const [cardTheme] = useState<CardTheme>('eagle');
  const setCardTheme = (_theme: CardTheme) => {}; // Eagle is now the only theme
  
  return (
    <ThemeContext.Provider value={{ cardTheme, setCardTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
