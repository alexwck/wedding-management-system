import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/app/actions/seat-assignment", () => ({
  cleanupOrphanedAssignments: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getFloorPlan, saveFloorPlan } from "@/app/actions/floor-plan";
import { mockFrom } from "../helpers/supabase-mock";

function mockServerClient(user: unknown) {
  const fromMock = vi.fn();
  fromMock.mockReturnValue(
    mockFrom({ data: { id: 1 }, error: null }),
  );
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: fromMock,
  } as never);
  return fromMock;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFloorPlan", () => {
  it("returns error for unauthenticated users", async () => {
    mockServerClient(null);
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn() } as never);

    const result = await getFloorPlan(1);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Not authenticated.");
  });

  it("returns null floor plan when none exists", async () => {
    mockServerClient({ id: "u1", app_metadata: { role: "admin" } });

    const adminFromMock = vi.fn();
    adminFromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({
      from: adminFromMock,
    } as never);

    const result = await getFloorPlan(1);
    expect(result.success).toBe(true);
    if (result.success) expect(result.floorPlan).toBeNull();
  });

  it("returns floor plan data on success", async () => {
    mockServerClient({ id: "u1", app_metadata: { role: "admin" } });

    const adminFromMock = vi.fn();
    adminFromMock.mockReturnValueOnce(
      mockFrom({
        data: {
          id: 1,
          wedding_id: 1,
          width: 50,
          height: 50,
          items: [],
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        error: null,
      }),
    );
    vi.mocked(createAdminClient).mockReturnValue({
      from: adminFromMock,
    } as never);

    const result = await getFloorPlan(1);
    expect(result.success).toBe(true);
  });

  it("returns error for non-admin without access", async () => {
    const serverFromMock = vi.fn();
    serverFromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: null }),
    );
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "u1", app_metadata: { role: "couple" } } },
        }),
      },
      from: serverFromMock,
    } as never);

    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn() } as never);

    const result = await getFloorPlan(1);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Access denied.");
  });
});

describe("saveFloorPlan", () => {
  it("returns error for unauthenticated users", async () => {
    mockServerClient(null);
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn() } as never);

    const result = await saveFloorPlan(1, {
      width: 50,
      height: 50,
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Not authenticated.");
  });

  it("returns validation error for invalid data", async () => {
    mockServerClient({ id: "u1", app_metadata: { role: "admin" } });
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn() } as never);

    const result = await saveFloorPlan(1, {
      width: 0,
      height: 0,
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Validation failed");
    }
  });

  it("returns error on upsert failure", async () => {
    mockServerClient({ id: "u1", app_metadata: { role: "admin" } });

    const adminFromMock = vi.fn();
    adminFromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { message: "db error" } }),
    );
    vi.mocked(createAdminClient).mockReturnValue({
      from: adminFromMock,
    } as never);

    const result = await saveFloorPlan(1, {
      width: 50,
      height: 50,
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to save floor plan.");
    }
  });

  it("returns success on valid save", async () => {
    mockServerClient({ id: "u1", app_metadata: { role: "admin" } });

    const adminFromMock = vi.fn();
    adminFromMock.mockReturnValueOnce(
      mockFrom({
        data: {
          id: 1,
          wedding_id: 1,
          width: 50,
          height: 50,
          items: [],
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        error: null,
      }),
    );
    vi.mocked(createAdminClient).mockReturnValue({
      from: adminFromMock,
    } as never);

    const result = await saveFloorPlan(1, {
      width: 50,
      height: 50,
      items: [],
    });
    expect(result.success).toBe(true);
  });
});
