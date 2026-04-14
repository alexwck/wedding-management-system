import { z } from "zod";

export const rsvpSchema = z.object({
  guestName: z.string().min(1, "Name is required"),
  status: z.enum(["attending", "declining"], {
    message: "Please select your RSVP status",
  }),
  dietaryNotes: z.string().max(500, "Dietary notes must be 500 characters or less").optional(),
  isVegetarian: z.boolean(),
  needsBabyChair: z.boolean(),
});

export type RSVPFormData = z.infer<typeof rsvpSchema>;
