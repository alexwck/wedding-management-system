import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockFrom, createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { toggleWeddingLock } from "@/app/actions/admin";

describe("toggleWeddingLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flips is_locked from false to true", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const { createAdminClient } = await import("@/lib/supabase/admin");

    const mockServerClient = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin-1", app_metadata: { role: "admin" } } } }) },
    };
    vi.mocked(createClient).mockResolvedValue(mockServerClient as never);

    const mockAdmin = createMockSupabaseClient([]);
    // First .from() call: fetch current lock state
    mockAdmin.from.mockReturnValueOnce(
      mockFrom({ data: { is_locked: false, slug: "test-wedding" }, error: null })
    );
    // Second .from() call: update
    mockAdmin.from.mockReturnValueOnce(
      mockFrom({ data: { slug: "test-wedding", is_locked: true }, error: null })
    );
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);

    const result = await toggleWeddingLock(1);

    expect(result).toEqual({ success: true, isLocked: true });
  });

  it("rejects non-admin users", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockServerClient = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "couple-1", app_metadata: { role: "couple" } } } }) },
    };
    vi.mocked(createClient).mockResolvedValue(mockServerClient as never);

    const result = await toggleWeddingLock(1);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Admin");
    }
  });
});
