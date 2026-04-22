import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/validations/upload";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadTemplateImage } from "@/app/actions/upload";
import { mockFrom } from "../helpers/supabase-mock";

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

describe("uploadTemplateImage action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeFormData(file: File | null, weddingId: string | null) {
    const fd = new FormData();
    if (file) fd.set("file", file);
    if (weddingId) fd.set("weddingId", weddingId);
    return fd;
  }

  it("returns validation error when file is missing", async () => {
    const fd = makeFormData(null, "1");
    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });

  it("returns validation error when weddingId is missing", async () => {
    const file = new File(["data"], "test.png", { type: "image/png" });
    const fd = makeFormData(file, null);
    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });

  it("returns invalid_type for non-image files", async () => {
    const file = new File(["data"], "test.pdf", { type: "application/pdf" });
    const fd = makeFormData(file, "1");
    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("invalid_type");
  });

  it("returns file_too_large for oversized files", async () => {
    const bigFile = new File(["x".repeat(6 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });
    Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 });
    const fd = makeFormData(bigFile, "1");
    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("file_too_large");
  });

  it("returns upload_failed on storage error", async () => {
    const file = new File(["data"], "test.png", { type: "image/png" });
    const fd = makeFormData(file, "1");

    vi.mocked(createAdminClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("upload_failed");
  });

  it("returns success on valid upload", async () => {
    const file = new File(["data"], "test.png", { type: "image/png" });
    const fd = makeFormData(file, "1");

    const fromMock = vi.fn();
    // Call: update wedding with public URL
    fromMock.mockReturnValueOnce(mockFrom({ error: null }));

    vi.mocked(createAdminClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: "https://example.com/1/template.png" },
          }),
        }),
      },
      from: fromMock,
    } as never);

    const result = await uploadTemplateImage(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.imageUrl).toBe("https://example.com/1/template.png");
    }
  });
});
