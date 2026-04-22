import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/app/actions/seat-assignment", () => ({
  assignSeat: vi.fn(),
  unassignSeat: vi.fn(),
  getSeatAssignments: vi.fn(),
  getUnassignedGuests: vi.fn(),
}));

import {
  assignSeat,
  unassignSeat,
  getSeatAssignments,
  getUnassignedGuests,
} from "@/app/actions/seat-assignment";
import { useSeatAssignments } from "@/components/floor-plan/hooks/use-seat-assignments";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSeatAssignments", () => {
  it("starts in loading state", () => {
    vi.mocked(getSeatAssignments).mockReturnValue(new Promise(() => {}));
    vi.mocked(getUnassignedGuests).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useSeatAssignments(1));
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches assignments and guests on mount", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [
        {
          id: 1,
          wedding_id: 1,
          rsvp_id: 2,
          chairItemId: "chair-1",
          tableItemId: "table-1",
          guestName: "Alice",
          rsvpId: 2,
          created_at: "now",
          updated_at: "now",
        },
      ],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [{ id: 3, guestName: "Bob" }],
    } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assignmentMap).toEqual({
      "chair-1": { guestName: "Alice", rsvpId: 2 },
    });
    expect(result.current.unassignedGuests).toEqual([
      { id: 3, guestName: "Bob" },
    ]);
  });

  it("assigns guest optimistically", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [{ id: 2, guestName: "Alice" }],
    } as never);
    vi.mocked(assignSeat).mockResolvedValue({ success: true } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.assignGuest(2, "chair-1", "table-1", "Alice");
    });

    expect(result.current.assignmentMap["chair-1"]).toEqual({
      guestName: "Alice",
      rsvpId: 2,
    });
    expect(result.current.unassignedGuests).toHaveLength(0);
  });

  it("rolls back on assign failure", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [{ id: 2, guestName: "Alice" }],
    } as never);
    vi.mocked(assignSeat).mockResolvedValue({
      success: false,
      error: "fail",
    } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.assignGuest(2, "chair-1", "table-1", "Alice");
    });

    // After failure, fetchAssignments is called to restore server state
    expect(getSeatAssignments).toHaveBeenCalledTimes(2); // mount + rollback
  });

  it("unassigns guest optimistically", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [
        {
          id: 1,
          wedding_id: 1,
          rsvp_id: 2,
          chairItemId: "chair-1",
          tableItemId: "table-1",
          guestName: "Alice",
          rsvpId: 2,
          created_at: "now",
          updated_at: "now",
        },
      ],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [],
    } as never);
    vi.mocked(unassignSeat).mockResolvedValue({ success: true } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.unassignGuest("chair-1");
    });

    expect(result.current.assignmentMap["chair-1"]).toBeUndefined();
    expect(result.current.unassignedGuests).toEqual([
      { id: 2, guestName: "Alice" },
    ]);
  });

  it("rolls back on unassign failure", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [
        {
          id: 1,
          wedding_id: 1,
          rsvp_id: 2,
          chairItemId: "chair-1",
          tableItemId: "table-1",
          guestName: "Alice",
          rsvpId: 2,
          created_at: "now",
          updated_at: "now",
        },
      ],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [],
    } as never);
    vi.mocked(unassignSeat).mockResolvedValue({
      success: false,
      error: "fail",
    } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.unassignGuest("chair-1");
    });

    expect(getSeatAssignments).toHaveBeenCalledTimes(2);
  });

  it("returns error when unassigning unassigned chair", async () => {
    vi.mocked(getSeatAssignments).mockResolvedValue({
      success: true,
      assignments: [],
    } as never);
    vi.mocked(getUnassignedGuests).mockResolvedValue({
      success: true,
      guests: [],
    } as never);

    const { result } = renderHook(() => useSeatAssignments(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const res = await result.current.unassignGuest("unknown-chair");
    expect(res.success).toBe(false);
  });
});
