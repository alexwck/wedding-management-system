import { z } from "zod";

const createCoupleBaseSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required"),
  coupleName: z.string().min(1, "Couple name is required"),
});

/** Server-side schema (no confirmPassword — server never receives it) */
export const createCoupleSchema = createCoupleBaseSchema;

/** Client-side schema with password confirmation */
export const createCoupleFormSchema = createCoupleBaseSchema
  .extend({
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateCoupleFormData = z.infer<typeof createCoupleFormSchema>;
