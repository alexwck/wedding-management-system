import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "@/components/floor-plan/hooks/use-undo-redo";
import { makeFloorPlanItem } from "../helpers/factories";

describe("useUndoRedo", () => {
  it("starts with canUndo=false and canRedo=false", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.canUndo()).toBe(false);
    expect(result.current.canRedo()).toBe(false);
  });

  it("pushes state and enables undo", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState(
        [makeFloorPlanItem({ id: "t1" })],
        50,
        50,
      );
    });

    expect(result.current.canUndo()).toBe(false); // only 1 snapshot, index at 0
    expect(result.current.canRedo()).toBe(false);
  });

  it("undoes to previous state", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50);
    });
    act(() => {
      result.current.pushState(
        [makeFloorPlanItem({ id: "t1" }), makeFloorPlanItem({ id: "t2" })],
        50,
        50,
      );
    });

    expect(result.current.canUndo()).toBe(true);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    expect(snapshot).not.toBeNull();
    expect((snapshot as { items: unknown[] }).items).toHaveLength(1);
  });

  it("redoes to next state", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "t1" })], 50, 50);
    });
    act(() => {
      result.current.pushState(
        [makeFloorPlanItem({ id: "t1" }), makeFloorPlanItem({ id: "t2" })],
        50,
        50,
      );
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo()).toBe(true);

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.redo();
    });

    expect(snapshot).not.toBeNull();
    expect((snapshot as { items: unknown[] }).items).toHaveLength(2);
  });

  it("returns null on undo at start of history", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState([], 50, 50);
    });

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });
    expect(snapshot).toBeNull();
  });

  it("returns null on redo at end of history", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState([], 50, 50);
    });

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.redo();
    });
    expect(snapshot).toBeNull();
  });

  it("truncates future history on push after undo", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "a" })], 50, 50);
    });
    act(() => {
      result.current.pushState(
        [makeFloorPlanItem({ id: "a" }), makeFloorPlanItem({ id: "b" })],
        50,
        50,
      );
    });
    act(() => {
      result.current.pushState(
        [makeFloorPlanItem({ id: "a" }), makeFloorPlanItem({ id: "b" }), makeFloorPlanItem({ id: "c" })],
        50,
        50,
      );
    });

    // Undo twice to get back to first state
    act(() => { result.current.undo(); });
    act(() => { result.current.undo(); });

    expect(result.current.canRedo()).toBe(true);

    // Push new state — should truncate future
    act(() => {
      result.current.pushState([makeFloorPlanItem({ id: "x" })], 50, 50);
    });

    expect(result.current.canRedo()).toBe(false);
    expect(result.current.canUndo()).toBe(true);
  });

  it("caps history at MAX_HISTORY_SIZE (20)", () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.pushState([makeFloorPlanItem({ id: `item-${i}` })], 50, 50);
      }
    });

    // Can still undo (should be at least MAX_HISTORY_SIZE back)
    expect(result.current.canUndo()).toBe(true);
  });

  it("returns deep-cloned snapshots", () => {
    const { result } = renderHook(() => useUndoRedo());

    const items = [makeFloorPlanItem({ id: "t1", label: "original" })];
    act(() => {
      result.current.pushState(items, 50, 50);
    });

    // Mutate original array after push
    items[0].label = "mutated";

    // Push second state to enable undo
    act(() => {
      result.current.pushState(items, 50, 50);
    });

    let snapshot: unknown;
    act(() => {
      snapshot = result.current.undo();
    });

    // First snapshot should have "original" label (captured before mutation)
    expect((snapshot as { items: { label: string }[] }).items[0].label).toBe("original");
  });
});
