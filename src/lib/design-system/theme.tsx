"use client";

import React from "react";
import type { ThemeContextValue } from "@/types/theme";
import { DEFAULT_THEME, mergeTheme } from "./theme-config";
import type { ThemeProviderProps } from "./theme-config";

export { DEFAULT_THEME, mergeTheme } from "./theme-config";
export type { ThemeProviderProps } from "./theme-config";

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isGlobalDefault: true,
});

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children, globalTheme, weddingTheme }: ThemeProviderProps) {
  const theme = React.useMemo(() => {
    const merged = mergeTheme(globalTheme ?? DEFAULT_THEME, weddingTheme);
    return merged;
  }, [globalTheme, weddingTheme]);

  const isGlobalDefault = !weddingTheme;

  return (
    <ThemeContext.Provider value={{ theme, isGlobalDefault }}>
      {children}
    </ThemeContext.Provider>
  );
}
