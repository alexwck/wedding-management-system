import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockFrom } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/admin", () => {
  const mockFrom = vi.fn();
  return {
    createAdminClient: () => ({ from: mockFrom }),
    _mockFrom: mockFrom,
  };
});

vi.mock("@/lib/auth-guards", () => ({
  getAuthAndVerifyAccess: vi.fn(),
  verifyWeddingNotLocked: vi.fn(),
}));

import { submitRSVP } from "@/app/actions/rsvp";
import { verifyWeddingNotLocked } from "@/lib/auth-guards";

describe("submitRSVP lock check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validInput = {
    slug: "test-wedding",
    guestName: "Alice",
    status: "attending" as const,
    isVegetarian: false,
    needsBabyChair: false,
  };

  it("rejects RSVP when wedding is locked", async () => {
    const { _mockFrom } = await import("@/lib/supabase/admin") as unknown as { _mockFrom: ReturnType<typeof vi.fn> };

    // First .from() call: wedding lookup
    _mockFrom.mockReturnValueOnce(
      mockFrom({ data: { id: 1 }, error: null })
    );

    vi.mocked(verifyWeddingNotLocked).mockResolvedValue({
      ok: false,
      error: "This wedding has been locked. No edits are permitted.",
    });

    const result = await submitRSVP(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("locked");
      expect(result.message).toContain("locked");
    }
  });

  it("allows RSVP when wedding is unlocked", async () => {
    const { _mockFrom } = await import("@/lib/supabase/admin") as unknown as { _mockFrom: ReturnType<typeof vi.fn> };

    // First .from() call: wedding lookup
    _mockFrom.mockReturnValueOnce(
      mockFrom({ data: { id: 1 }, error: null })
    );
    // Second .from() call: duplicate check
    _mockFrom.mockReturnValueOnce(
      mockFrom({ data: null })
    );
    // Third .from() call: insert
    _mockFrom.mockReturnValueOnce(
      mockFrom({ error: null })
    );

    vi.mocked(verifyWeddingNotLocked).mockResolvedValue({ ok: true });

    const result = await submitRSVP(validInput);

    expect(result.success).toBe(true);
  });
});
