import { describe, it, expect } from "vitest";
import { MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/validations/upload";

describe("upload validation", () => {
  describe("file size validation", () => {
    it("rejects files larger than 5MB", () => {
      const oversizedFile = { size: 6 * 1024 * 1024, type: "image/jpeg" };
      expect(oversizedFile.size > MAX_FILE_SIZE).toBe(true);
    });

    it("accepts files exactly 5MB", () => {
      const exactLimitFile = { size: 5 * 1024 * 1024, type: "image/jpeg" };
      expect(exactLimitFile.size <= MAX_FILE_SIZE).toBe(true);
    });

    it("accepts files under 5MB", () => {
      const smallFile = { size: 4 * 1024 * 1024, type: "image/png" };
      expect(smallFile.size <= MAX_FILE_SIZE).toBe(true);
    });
  });

  describe("file type validation", () => {
    it("rejects GIF files", () => {
      expect(ALLOWED_TYPES.includes("image/gif")).toBe(false);
    });

    it("rejects SVG files", () => {
      expect(ALLOWED_TYPES.includes("image/svg+xml")).toBe(false);
    });

    it("rejects WebP files", () => {
      expect(ALLOWED_TYPES.includes("image/webp")).toBe(false);
    });

    it("accepts PNG files", () => {
      expect(ALLOWED_TYPES.includes("image/png")).toBe(true);
    });

    it("accepts JPEG files", () => {
      expect(ALLOWED_TYPES.includes("image/jpeg")).toBe(true);
    });
  });
});
