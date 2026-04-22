import { describe, it, expect } from "vitest";
import {
  assignSeatSchema,
  unassignSeatSchema,
  getSeatAssignmentsSchema,
  getUnassignedGuestsSchema,
  cleanupOrphanedAssignmentsSchema,
} from "@/lib/validations/seat-assignment";

describe("seat assignment validations", () => {
  describe("assignSeatSchema", () => {
    it("accepts valid assignment input", () => {
      const result = assignSeatSchema.safeParse({
        weddingId: 1,
        rsvpId: 2,
        chairItemId: "fp-ch-1",
        tableItemId: "fp-rt-1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      const result = assignSeatSchema.safeParse({
        weddingId: 1,
        rsvpId: 2,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative weddingId", () => {
      const result = assignSeatSchema.safeParse({
        weddingId: -1,
        rsvpId: 2,
        chairItemId: "fp-ch-1",
        tableItemId: "fp-rt-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty chairItemId", () => {
      const result = assignSeatSchema.safeParse({
        weddingId: 1,
        rsvpId: 2,
        chairItemId: "",
        tableItemId: "fp-rt-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero rsvpId", () => {
      const result = assignSeatSchema.safeParse({
        weddingId: 1,
        rsvpId: 0,
        chairItemId: "fp-ch-1",
        tableItemId: "fp-rt-1",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("unassignSeatSchema", () => {
    it("accepts valid unassign input", () => {
      const result = unassignSeatSchema.safeParse({
        weddingId: 1,
        chairItemId: "fp-ch-1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing chairItemId", () => {
      const result = unassignSeatSchema.safeParse({
        weddingId: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getSeatAssignmentsSchema", () => {
    it("accepts valid wedding ID", () => {
      const result = getSeatAssignmentsSchema.safeParse({ weddingId: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects string wedding ID", () => {
      const result = getSeatAssignmentsSchema.safeParse({ weddingId: "abc" });
      expect(result.success).toBe(false);
    });
  });

  describe("getUnassignedGuestsSchema", () => {
    it("accepts valid input", () => {
      const result = getUnassignedGuestsSchema.safeParse({ weddingId: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("cleanupOrphanedAssignmentsSchema", () => {
    it("accepts valid input", () => {
      const result = cleanupOrphanedAssignmentsSchema.safeParse({ weddingId: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects zero weddingId", () => {
      const result = cleanupOrphanedAssignmentsSchema.safeParse({ weddingId: 0 });
      expect(result.success).toBe(false);
    });
  });
});
