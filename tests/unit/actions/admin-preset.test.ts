import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateWeddingPreset } from "@/app/actions/admin";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

const mockAuthGetUser = vi.fn();
const mockClient = {
  auth: { getUser: mockAuthGetUser },
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mockClient),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";

describe("updateWeddingPreset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null } });
    const result = await updateWeddingPreset(1, "cinematic");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated.");
  });

  it("rejects invalid preset names", async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: "user-1", app_metadata: { role: "admin" } } },
    });
    const result = await updateWeddingPreset(1, "invalid-preset");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid preset name.");
  });

  it("updates preset for authorized admin", async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: "user-1", app_metadata: { role: "admin" } } },
    });

    const mockAdmin = createMockSupabaseClient([
      { data: { is_locked: false, slug: "test-wedding" } },
      { data: { slug: "test-wedding", layout_preset: "cinematic" } },
    ]);
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as unknown as ReturnType<typeof createAdminClient>);

    const result = await updateWeddingPreset(1, "cinematic");
    expect(result.success).toBe(true);
    expect(result.layoutPreset).toBe("cinematic");
  });

  it("rejects updates to locked weddings", async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: "user-1", app_metadata: { role: "admin" } } },
    });

    const mockAdmin = createMockSupabaseClient([
      { data: { is_locked: true, slug: "test-wedding" } },
    ]);
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as unknown as ReturnType<typeof createAdminClient>);

    const result = await updateWeddingPreset(1, "cinematic");
    expect(result.success).toBe(false);
    expect(result.error).toContain("locked");
  });
});
