import { z } from "zod";

export const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  glassBlurRadius: z.number().min(0).max(32).optional(),
  borderOpacity: z.number().min(0).max(1).optional(),
  borderRadius: z.string().optional(),
  fontFamily: z.enum(["sans", "serif"]).optional(),
});

export type ThemeSchemaType = z.infer<typeof ThemeSchema>;
