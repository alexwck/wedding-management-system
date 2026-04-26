import React from "react";
import type { ThemeConfiguration, ThemeContextValue } from "@/types/theme";

export const DEFAULT_THEME: Required<ThemeConfiguration> = {
  primaryColor: "#E8D5C4",
  accentColor: "#C4B5A0",
  glassBlurRadius: 16,
  borderOpacity: 0.2,
  borderRadius: "16px",
  fontFamily: "sans",
};

export function mergeTheme(global: ThemeConfiguration, override?: ThemeConfiguration | null): Required<ThemeConfiguration> {
  return {
    primaryColor: override?.primaryColor ?? global.primaryColor ?? DEFAULT_THEME.primaryColor,
    accentColor: override?.accentColor ?? global.accentColor ?? DEFAULT_THEME.accentColor,
    glassBlurRadius: override?.glassBlurRadius ?? global.glassBlurRadius ?? DEFAULT_THEME.glassBlurRadius,
    borderOpacity: override?.borderOpacity ?? global.borderOpacity ?? DEFAULT_THEME.borderOpacity,
    borderRadius: override?.borderRadius ?? global.borderRadius ?? DEFAULT_THEME.borderRadius,
    fontFamily: override?.fontFamily ?? global.fontFamily ?? DEFAULT_THEME.fontFamily,
  };
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isGlobalDefault: true,
});

export function useTheme(): ThemeContextValue {
  return React.useContext(ThemeContext);
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  globalTheme?: ThemeConfiguration;
  weddingTheme?: ThemeConfiguration | null;
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
