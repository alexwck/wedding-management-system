import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { updateWeddingDetails } from "@/app/actions/admin";
import { mockFrom } from "../helpers/supabase-mock";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateWeddingDetails", () => {
  function makeFormData(data: Record<string, string>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
  }

  it("updates wedding with all venue fields", async () => {
    const fd = makeFormData({
      weddingId: "1",
      venue: "The Grand Ballroom",
      venue_address: "123 Main St",
      venue_lat: "39.7817",
      venue_lng: "-89.6501",
      welcome_message: "Welcome!",
    });

    const fromMock = vi.fn().mockReturnValue(
      mockFrom({
        data: { id: 1, venue: "The Grand Ballroom" },
        error: null,
      }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "admin-1", app_metadata: { role: "admin" } } },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(true);
  });

  it("updates wedding with venue name only", async () => {
    const fd = makeFormData({
      weddingId: "1",
      venue: "The Grand Ballroom",
    });

    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: { id: 1 }, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "admin-1", app_metadata: { role: "admin" } } },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(true);
  });

  it("rejects unauthorized user", async () => {
    const fd = makeFormData({
      weddingId: "1",
      venue: "Test",
    });

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("unauthorized");
  });

  it("rejects couple who does not own the wedding", async () => {
    const fd = makeFormData({
      weddingId: "1",
      venue: "Test",
    });

    // Wedding belongs to user-1, not user-2
    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { user_id: "user-1" }, error: null }),
    );
    fromMock.mockReturnValue(
      mockFrom({ data: null, error: null }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-2", app_metadata: { role: "couple" } } },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("unauthorized");
  });

  it("rejects invalid coordinate pair (lat only)", async () => {
    const fd = makeFormData({
      weddingId: "1",
      venue_lat: "40.7128",
    });

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "admin-1", app_metadata: { role: "admin" } } },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });

  it("rejects welcome_message over 500 chars", async () => {
    const fd = makeFormData({
      weddingId: "1",
      welcome_message: "a".repeat(501),
    });

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "admin-1", app_metadata: { role: "admin" } } },
        }),
      },
      from: vi.fn(),
    } as never);

    const result = await updateWeddingDetails(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });
});
