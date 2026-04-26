export interface ThemeConfiguration {
  primaryColor?: string;
  accentColor?: string;
  glassBlurRadius?: number;
  borderOpacity?: number;
  borderRadius?: string;
  fontFamily?: "sans" | "serif";
}

export interface ThemeContextValue {
  theme: Required<ThemeConfiguration>;
  isGlobalDefault: boolean;
}
