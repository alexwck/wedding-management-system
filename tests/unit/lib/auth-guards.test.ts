import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => {
  const mockFrom = vi.fn();
  return {
    createAdminClient: () => ({
      from: mockFrom,
    }),
    _mockFrom: mockFrom,
  };
});

import { verifyWeddingNotLocked } from "@/lib/auth-guards";
import { mockFrom } from "../helpers/supabase-mock";

describe("verifyWeddingNotLocked", () => {
  let _mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const adminModule = await import("@/lib/supabase/admin");
    _mockFrom = (adminModule as unknown as { _mockFrom: ReturnType<typeof vi.fn> })._mockFrom;
    _mockFrom.mockReset();
  });

  it("returns { ok: true } for unlocked wedding", async () => {
    _mockFrom.mockReturnValue(
      mockFrom({ data: { is_locked: false }, error: null })
    );

    const result = await verifyWeddingNotLocked(1);
    expect(result).toEqual({ ok: true });
  });

  it("returns { ok: false, error } for locked wedding", async () => {
    _mockFrom.mockReturnValue(
      mockFrom({ data: { is_locked: true }, error: null })
    );

    const result = await verifyWeddingNotLocked(1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("locked");
    }
  });

  it("returns { ok: false, error } when wedding not found", async () => {
    _mockFrom.mockReturnValue(
      mockFrom({ data: null, error: { message: "Not found" } })
    );

    const result = await verifyWeddingNotLocked(999);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("not found");
    }
  });
});
