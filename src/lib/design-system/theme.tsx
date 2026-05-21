"use client";

import React from "react";
import type { ThemeContextValue } from "@/types/theme";
import { DEFAULT_THEME } from "./theme-config";
import type { ThemeProviderProps } from "./theme-config";

export { DEFAULT_THEME } from "./theme-config";
export type { ThemeProviderProps } from "./theme-config";

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isGlobalDefault: true,
});

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children, globalTheme }: ThemeProviderProps) {
  const theme = globalTheme ?? DEFAULT_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isGlobalDefault: true }}>
      {children}
    </ThemeContext.Provider>
  );
}
