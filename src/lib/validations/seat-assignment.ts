import { z } from "zod";

export const assignSeatSchema = z.object({
  weddingId: z.number().int().positive(),
  rsvpId: z.number().int().positive(),
  chairItemId: z.string().min(1),
  tableItemId: z.string().min(1),
});

export const unassignSeatSchema = z.object({
  weddingId: z.number().int().positive(),
  chairItemId: z.string().min(1),
});

export const getSeatAssignmentsSchema = z.object({
  weddingId: z.number().int().positive(),
});

export const getUnassignedGuestsSchema = z.object({
  weddingId: z.number().int().positive(),
});

export const cleanupOrphanedAssignmentsSchema = z.object({
  weddingId: z.number().int().positive(),
});
