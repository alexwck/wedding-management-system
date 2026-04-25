import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "@/components/floor-plan/hooks/use-undo-redo";
import { makeFloorPlanItem } from "../helpers/factories";

const EMPTY_MAP = {};
const EMPTY_GUESTS: { id: number; guestName: string }[] = [];

function push(
  result: { current: ReturnType<typeof useUndoRedo> },
  items: ReturnType<typeof makeFloorPlanItem>[],
  assignmentMap = EMPTY_MAP,
  unassignedGuests = EMPTY_GUESTS,
) {
  act(() => {
    result.current.pushState(items, 50, 50, assignmentMap, unassignedGuests);
  });
}

describe("useUndoRedo", () => {
  it("starts with canUndo=false and canRedo=false", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("pushes state and enables undo after 2 pushes", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, [makeFloorPlanItem({ id: "t1" })]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);

    push(result, [makeFloorPlanItem({ id: "t1" }), makeFloorPlanItem({ id: "t2" })]);
    expect(result.current.canUndo).toBe(true);
  });

  it("undoes to previous state", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, [makeFloorPlanItem({ id: "t1" })]);
    push(result, [makeFloorPlanItem({ id: "t1" }), makeFloorPlanItem({ id: "t2" })]);

    expect(result.current.canUndo).toBe(true);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    expect(snapshot).not.toBeNull();
    expect((snapshot as { items: unknown[] }).items).toHaveLength(1);
  });

  it("redoes to next state", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, [makeFloorPlanItem({ id: "t1" })]);
    push(result, [makeFloorPlanItem({ id: "t1" }), makeFloorPlanItem({ id: "t2" })]);

    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.redo();
    });

    expect(snapshot).not.toBeNull();
    expect((snapshot as { items: unknown[] }).items).toHaveLength(2);
  });

  it("returns null on undo at start of history", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, []);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });
    expect(snapshot).toBeNull();
  });

  it("returns null on redo at end of history", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, []);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.redo();
    });
    expect(snapshot).toBeNull();
  });

  it("truncates future history on push after undo", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, [makeFloorPlanItem({ id: "a" })]);
    push(result, [makeFloorPlanItem({ id: "a" }), makeFloorPlanItem({ id: "b" })]);
    push(result, [makeFloorPlanItem({ id: "a" }), makeFloorPlanItem({ id: "b" }), makeFloorPlanItem({ id: "c" })]);

    act(() => { result.current.undo(); });
    act(() => { result.current.undo(); });

    expect(result.current.canRedo).toBe(true);

    push(result, [makeFloorPlanItem({ id: "x" })]);

    expect(result.current.canRedo).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  it("caps history at MAX_HISTORY_SIZE (20)", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.pushState([makeFloorPlanItem({ id: `item-${i}` })], 50, 50, EMPTY_MAP, EMPTY_GUESTS);
      }
    });

    expect(result.current.canUndo).toBe(true);
  });

  it("undo returns to previous state after sequential pushes (single undo per action)", () => {
    const { result } = renderHook(() => useUndoRedo());

    push(result, []);
    push(result, [makeFloorPlanItem({ id: "a" })]);
    push(result, [makeFloorPlanItem({ id: "a" }), makeFloorPlanItem({ id: "b" })]);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    expect(snapshot).not.toBeNull();
    expect((snapshot as { items: unknown[] }).items).toHaveLength(1);
    expect((snapshot as { items: { id: string }[] }).items[0].id).toBe("a");
  });

  it("returns deep-cloned snapshots", () => {
    const { result } = renderHook(() => useUndoRedo());

    const items = [makeFloorPlanItem({ id: "t1", label: "original" })];
    push(result, items);

    items[0].label = "mutated";

    push(result, items);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    expect((snapshot as { items: { label: string }[] }).items[0].label).toBe("original");
  });

  it("captures and restores assignmentMap in snapshots", () => {
    const { result } = renderHook(() => useUndoRedo());

    const map1 = { "chair-1": { guestName: "Alice", rsvpId: 1 } };
    const guests1 = [{ id: 2, guestName: "Bob" }];
    const map2 = { "chair-1": { guestName: "Alice", rsvpId: 1 }, "chair-2": { guestName: "Bob", rsvpId: 2 } };
    const guests2: typeof guests1 = [];

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50, map1, guests1);
    });
    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50, map2, guests2);
    });

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    const s = snapshot as { assignmentMap: Record<string, { guestName: string }>; unassignedGuests: { guestName: string }[] };
    expect(s.assignmentMap).toEqual(map1);
    expect(s.unassignedGuests).toEqual(guests1);
  });

  it("deep-clones assignmentMap so mutations don't affect snapshots", () => {
    const { result } = renderHook(() => useUndoRedo());

    const map = { "chair-1": { guestName: "Alice", rsvpId: 1 } };
    const guests = [{ id: 2, guestName: "Bob" }];

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50, map, guests);
    });

    // Mutate original after push — snapshot should still have "Alice"
    map["chair-1"].guestName = "Mutated";

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50, map, guests);
    });

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    const s = snapshot as { assignmentMap: Record<string, { guestName: string }> };
    expect(s.assignmentMap["chair-1"].guestName).toBe("Alice");
  });
});
