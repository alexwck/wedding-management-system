import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signOut", () => {
  it("returns success when signOut succeeds", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { signOut: vi.fn().mockResolvedValue({ error: null }) },
    } as never);

    const result = await signOut();
    expect(result.success).toBe(true);
  });

  it("returns error when signOut fails", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: { message: "Session not found" },
        }),
      },
    } as never);

    const result = await signOut();
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Session not found");
  });
});
