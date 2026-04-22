import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  getAuthAndVerifyAccess: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthAndVerifyAccess } from "@/lib/auth-guards";
import { submitRSVP, updateRsvpStatus } from "@/app/actions/rsvp";
import { mockFrom } from "../helpers/supabase-mock";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitRSVP", () => {
  const validData = {
    slug: "test-wedding",
    guestName: "Alice",
    status: "attending" as const,
    dietaryNotes: "",
    isVegetarian: false,
    needsBabyChair: false,
  };

  it("returns validation error for empty guest name", async () => {
    const result = await submitRSVP({ ...validData, guestName: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("validation");
  });

  it("returns not_found for unknown slug", async () => {
    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { message: "not found" } }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await submitRSVP(validData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("not_found");
  });

  it("returns duplicate_name for existing guest", async () => {
    const fromMock = vi.fn();
    // Call 1: find wedding
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 1 }, error: null }));
    // Call 2: check existing RSVP
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 99 }, error: null }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await submitRSVP(validData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("duplicate_name");
  });

  it("returns duplicate_name on 23505 constraint violation", async () => {
    const fromMock = vi.fn();
    // Call 1: find wedding
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 1 }, error: null }));
    // Call 2: no existing RSVP
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    // Call 3: insert fails with unique violation
    fromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { code: "23505" } }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await submitRSVP(validData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("duplicate_name");
  });

  it("returns insert_failed on generic insert error", async () => {
    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 1 }, error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    fromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { code: "50000" } }),
    );

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await submitRSVP(validData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("insert_failed");
  });

  it("returns success on valid submission", async () => {
    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(mockFrom({ data: { id: 1 }, error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: null, error: null }));
    fromMock.mockReturnValueOnce(mockFrom({ data: {}, error: null }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await submitRSVP(validData);
    expect(result.success).toBe(true);
  });
});

describe("updateRsvpStatus", () => {
  it("rejects unauthenticated users", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: null,
      error: "Not authenticated.",
    } as const);

    const result = await updateRsvpStatus({
      weddingId: 1,
      rsvpId: 2,
      status: "attending",
    });
    expect(result.success).toBe(false);
  });

  it("returns updated RSVP on success", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      error: null,
    } as const);

    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { id: 2, status: "attending" }, error: null }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateRsvpStatus({
      weddingId: 1,
      rsvpId: 2,
      status: "attending",
    });
    expect(result.success).toBe(true);
  });

  it("returns error when update fails", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      error: null,
    } as const);

    const fromMock = vi.fn();
    fromMock.mockReturnValueOnce(
      mockFrom({ data: null, error: { message: "fail" } }),
    );
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateRsvpStatus({
      weddingId: 1,
      rsvpId: 2,
      status: "declining",
    });
    expect(result.success).toBe(false);
  });

  it("removes seat assignment when status changes to declining", async () => {
    vi.mocked(getAuthAndVerifyAccess).mockResolvedValue({
      user: { id: "u1" } as never,
      error: null,
    } as const);

    const fromMock = vi.fn();
    // Call 1: update RSVP
    fromMock.mockReturnValueOnce(
      mockFrom({ data: { id: 2, status: "declining" }, error: null }),
    );
    // Call 2: delete seat assignment
    fromMock.mockReturnValueOnce(mockFrom({ error: null }));

    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const result = await updateRsvpStatus({
      weddingId: 1,
      rsvpId: 2,
      status: "declining",
    });
    expect(result.success).toBe(true);
    // Verify delete was called (second fromMock call)
    expect(fromMock).toHaveBeenCalledTimes(2);
  });
});
