import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  getAuthAndVerifyAccess: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthAndVerifyAccess } from "@/lib/auth-guards";
import { assignSeat, unassignSeat, getSeatAssignments, getUnassignedGuests } from "@/app/actions/seat-assignment";

function mockFrom(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  // Non-terminal select returns chain; terminal await resolves via then
  chain.then = (resolve: (v: unknown) => void) => resolve(resolvedValue);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("assignSeat", () => {
  it("rejects unauthenticated users", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: null, error: "Not authenticated." } as const);

    const result = await assignSeat({
      weddingId: 1,
      rsvpId: 2,
      chairItemId: "chair-1",
      tableItemId: "table-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Not authenticated.");
  });

  it("rejects non-attending RSVPs", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: { id: "u1" } as never, error: null } as const);

    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 2, wedding_id: 1, status: "declining" }, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await assignSeat({
      weddingId: 1,
      rsvpId: 2,
      chairItemId: "chair-1",
      tableItemId: "table-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Only attending guests can be assigned.");
  });

  it("rejects already-assigned RSVPs", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: { id: "u1" } as never, error: null } as const);

    const fromMock = vi.fn();
    // Call 1: get RSVP (attending)
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 2, wedding_id: 1, status: "attending" }, error: null }));
    // Promise.all: existing RSVP assignment
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 99 }, error: null }));
    // Promise.all: chair check
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    // Promise.all: floor plan check
    fromMock.mockReturnValueOnce(mockFrom({ data: { items: [] }, error: null }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await assignSeat({
      weddingId: 1,
      rsvpId: 2,
      chairItemId: "chair-1",
      tableItemId: "table-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("This guest is already assigned to a seat.");
  });
});

describe("unassignSeat", () => {
  it("rejects unauthenticated users", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: null, error: "Not authenticated." } as const);

    const result = await unassignSeat({ weddingId: 1, chairItemId: "chair-1" });
    expect(result.success).toBe(false);
  });

  it("returns success on valid delete", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: { id: "u1" } as never, error: null } as const);

    const fromMock = vi.fn().mockReturnValue(mockFrom({ error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await unassignSeat({ weddingId: 1, chairItemId: "chair-1" });
    expect(result.success).toBe(true);
  });
});

describe("getSeatAssignments", () => {
  it("returns assignments with guest names", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: { id: "u1" } as never, error: null } as const);

    const fromMock = vi.fn().mockReturnValue(mockFrom({
      data: [
        { id: 1, wedding_id: 1, rsvp_id: 2, chair_item_id: "chair-1", table_item_id: "table-1", created_at: "now", updated_at: "now", rsvps: { guest_name: "Alice" } },
      ],
      error: null,
    }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getSeatAssignments(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0].guestName).toBe("Alice");
    }
  });
});

describe("getUnassignedGuests", () => {
  it("returns attending guests without assignments", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({ user: { id: "u1" } as never, error: null } as const);

    const fromMock = vi.fn();
    // Promise.all[0]: rsvps query
    fromMock.mockReturnValueOnce(mockFrom({
      data: [{ id: 1, guest_name: "Alice" }, { id: 2, guest_name: "Bob" }],
      error: null,
    }));
    // Promise.all[1]: assignments query
    fromMock.mockReturnValueOnce(mockFrom({
      data: [{ rsvp_id: 2 }],
      error: null,
    }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await getUnassignedGuests(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.guests).toHaveLength(1);
      expect(result.guests[0].guestName).toBe("Alice");
    }
  });
});
