import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateWeddingPreset } from "@/app/actions/admin";

// Mock Supabase clients
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ select: mockSelect })) }));
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) })),
  update: mockUpdate,
}));

const mockAdminClient = {
  from: mockFrom,
};

const mockAuthGetUser = vi.fn();
const mockClient = {
  auth: { getUser: mockAuthGetUser },
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockAdminClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mockClient),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

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
    mockSingle.mockResolvedValueOnce({ data: { is_locked: false, slug: "test-wedding" } });
    mockSingle.mockResolvedValueOnce({ data: { slug: "test-wedding", layout_preset: "cinematic" } });

    const result = await updateWeddingPreset(1, "cinematic");
    expect(result.success).toBe(true);
    expect(result.layoutPreset).toBe("cinematic");
  });

  it("rejects updates to locked weddings", async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: "user-1", app_metadata: { role: "admin" } } },
    });
    mockSingle.mockResolvedValueOnce({ data: { is_locked: true, slug: "test-wedding" } });

    const result = await updateWeddingPreset(1, "cinematic");
    expect(result.success).toBe(false);
    expect(result.error).toContain("locked");
  });
});
