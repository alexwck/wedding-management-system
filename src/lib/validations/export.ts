import { z } from "zod";

export const exportSchema = z.object({
  weddingId: z.number().int().positive(),
});
