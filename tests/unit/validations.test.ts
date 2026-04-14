import { describe, it, expect } from "vitest";
import { rsvpSchema } from "@/lib/validations/rsvp";

describe("rsvpSchema", () => {
  describe("valid inputs", () => {
    it("accepts a minimal valid RSVP", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane Doe",
        status: "attending",
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(true);
    });

    it("accepts RSVP with all fields", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane Doe",
        status: "declining",
        dietaryNotes: "No nuts please",
        isVegetarian: true,
        needsBabyChair: true,
      });
      expect(result.success).toBe(true);
    });

    it("accepts dietary notes at max length (500 chars)", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane",
        status: "attending",
        dietaryNotes: "a".repeat(500),
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("rejects empty guest name", () => {
      const result = rsvpSchema.safeParse({
        guestName: "",
        status: "attending",
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("rejects invalid status", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane",
        status: "maybe",
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects dietary notes over 500 chars", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane",
        status: "attending",
        dietaryNotes: "a".repeat(501),
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("500");
      }
    });

    it("rejects missing guestName", () => {
      const result = rsvpSchema.safeParse({
        status: "attending",
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing status", () => {
      const result = rsvpSchema.safeParse({
        guestName: "Jane",
        isVegetarian: false,
        needsBabyChair: false,
      });
      expect(result.success).toBe(false);
    });
  });
});
