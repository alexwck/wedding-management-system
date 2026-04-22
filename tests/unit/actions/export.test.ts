import { describe, it, expect } from "vitest";
import { exportSchema, handleGoogleCallbackSchema } from "@/lib/validations/export";

describe("export validations", () => {
  describe("exportSchema", () => {
    it("accepts valid wedding ID", () => {
      const result = exportSchema.safeParse({ weddingId: 1 });
      expect(result.success).toBe(true);
    });

    it("rejects missing weddingId", () => {
      const result = exportSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects negative weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects zero weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects string weddingId", () => {
      const result = exportSchema.safeParse({ weddingId: "abc" });
      expect(result.success).toBe(false);
    });
  });

  describe("handleGoogleCallbackSchema", () => {
    it("accepts valid callback data", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        code: "auth-code-123",
        state: "user-uuid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing code", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        state: "user-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty state", () => {
      const result = handleGoogleCallbackSchema.safeParse({
        code: "auth-code",
        state: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
