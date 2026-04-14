import { z } from "zod";

export const createCoupleSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required"),
  coupleName: z.string().min(1, "Couple name is required"),
});

export type CreateCoupleFormData = z.infer<typeof createCoupleSchema>;
