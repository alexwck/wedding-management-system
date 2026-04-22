import { z } from "zod";

export const exportSchema = z.object({
  weddingId: z.number().int().positive(),
});

export const handleGoogleCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
