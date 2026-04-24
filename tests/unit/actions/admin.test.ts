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

vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("abc12345"),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getAllWeddings,
  getWeddingRSVPs,
  createCoupleAccount,
  getCouples,
  getMyWeddingRSVPs,
  updateWeddingDate,
  updateWeddingTimezone,
} from "@/app/actions/admin";
import { mockFrom } from "../helpers/supabase-mock";
import { makeWedding, makeRsvp } from "../helpers/factories";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllWeddings", () => {
  it("returns weddings on success", async () => {
    const weddings = [makeWedding(), makeWedding({ id: 2, couple_name: "Carol & Dave" })];
    const fromMock = vi.fn().mockReturnValue(mockFrom({ data: weddings, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getAllWeddings();
    expect(result.success).toBe(true);
    if (result.success) expect(result.weddings).toHaveLength(2);
  });

  it("returns error on fetch failure", async () => {
    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: null, error: { message: "fail" } }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getAllWeddings();
    expect(result.success).toBe(false);
  });
});

describe("getWeddingRSVPs", () => {
  it("returns not_found for unknown wedding", async () => {
    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { message: "not found" } }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getWeddingRSVPs(999);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("not_found");
  });

  it("returns wedding with RSVPs and summary", async () => {
    const fromMock = vi.fn();
    // Call 1: wedding lookup
    fromMock.mockReturnValueOnce(
      mockFrom({
        data: makeWedding(),
        error: null,
      }),
    );
    // Call 2: RSVPs
    fromMock.mockReturnValueOnce(
      mockFrom({
        data: [makeRsvp(), makeRsvp({ id: 2, status: "declining", guest_name: "Bob" })],
        error: null,
      }),
    );
    // Call 3+4: enrichRsvpsWithSeats (seat_assignments + floor_plans)
    fromMock.mockReturnValue(mockFrom({ data: [], error: null }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getWeddingRSVPs(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.total).toBe(2);
      expect(result.summary.attending).toBe(1);
      expect(result.summary.declining).toBe(1);
    }
  });
});

describe("getCouples", () => {
  it("returns couples list on success", async () => {
    const couples = [{ id: "u1", display_name: "Alice", created_at: "2026-01-01" }];
    const fromMock = vi.fn().mockReturnValue(mockFrom({ data: couples, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getCouples();
    expect(result.success).toBe(true);
    if (result.success) expect(result.couples).toHaveLength(1);
  });
});

describe("createCoupleAccount", () => {
  function makeFormData(data: Record<string, string>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
  }

  it("returns validation error for missing fields", async () => {
    const fd = makeFormData({ email: "", password: "", displayName: "", coupleName: "" });
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn(), auth: { admin: { createUser: vi.fn() } } } as never);

    const result = await createCoupleAccount(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });

  it("returns auth_failed when user creation fails", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "password123",
      displayName: "Alice",
      coupleName: "Alice & Bob",
    });

    const fromMock = vi.fn().mockReturnValue(mockFrom({ data: null, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({
      from: fromMock,
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "email taken" },
          }),
          deleteUser: vi.fn(),
        },
      },
    } as never);

    const result = await createCoupleAccount(fd);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("auth_failed");
  });

  it("creates couple with wedding on success", async () => {
    const fd = makeFormData({
      email: "a@b.com",
      password: "password123",
      displayName: "Alice",
      coupleName: "Alice & Bob",
    });

    const fromMock = vi.fn();
    // Call 1: insert profile
    fromMock.mockReturnValueOnce(mockFrom({ error: null }));
    // Call 2: insert wedding (retry loop)
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { id: 1, slug: "abc12345" }, error: null }),
    );

    vi.mocked(createAdminClient).mockReturnValue({
      from: fromMock,
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: { id: "new-user" } },
            error: null,
          }),
          deleteUser: vi.fn(),
        },
      },
    } as never);

    const result = await createCoupleAccount(fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userId).toBe("new-user");
      expect(result.weddingId).toBe(1);
    }
  });
});

describe("getMyWeddingRSVPs", () => {
  it("returns unauthorized for unauthenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as never);

    const result = await getMyWeddingRSVPs();
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("unauthorized");
  });

  it("returns not_found when user has no wedding", async () => {
    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: null, error: { message: "none" } }),
    );
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "u1" } },
        }),
      },
      from: fromMock,
    } as never);

    const result = await getMyWeddingRSVPs();
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("not_found");
  });
});

describe("updateWeddingDate", () => {
  it("returns error for unauthenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const result = await updateWeddingDate(1, "2026-06-15T14:00");
    expect(result.success).toBe(false);
  });

  it("returns error for invalid date", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);

    const result = await updateWeddingDate(1, "not-a-date");
    expect(result.success).toBe(false);
  });

  it("updates wedding date on success", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);

    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: { slug: "test-wedding" }, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateWeddingDate(1, "2026-06-15T14:00");
    expect(result.success).toBe(true);
  });

  it("clears date when null passed", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);

    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: { slug: "test-wedding" }, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateWeddingDate(1, null);
    expect(result.success).toBe(true);
  });
});

describe("updateWeddingTimezone", () => {
  it("returns error for non-admin user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", app_metadata: { role: "couple" } } } }) },
    } as never);

    const result = await updateWeddingTimezone(1, "Asia/Kuala_Lumpur");
    expect(result.success).toBe(false);
  });

  it("returns error for invalid timezone", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", app_metadata: { role: "admin" } } } }) },
    } as never);

    const result = await updateWeddingTimezone(1, "Invalid/Tz");
    expect(result.success).toBe(false);
  });

  it("updates timezone on success", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", app_metadata: { role: "admin" } } } }) },
    } as never);

    const fromMock = vi.fn().mockReturnValue(
      mockFrom({ data: { slug: "test-wedding" }, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateWeddingTimezone(1, "America/New_York");
    expect(result.success).toBe(true);
  });
});
