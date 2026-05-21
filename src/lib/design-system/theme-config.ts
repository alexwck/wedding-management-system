import type { ThemeConfiguration } from "@/types/theme";

export const DEFAULT_THEME: Required<ThemeConfiguration> = {
  primaryColor: "#E8D5C4",
  accentColor: "#C4B5A0",
  glassBlurRadius: 16,
  borderOpacity: 0.2,
  borderRadius: "16px",
  fontFamily: "sans",
};


export interface ThemeProviderProps {
  children: import("react").ReactNode;
  globalTheme?: ThemeConfiguration;
}
