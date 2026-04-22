import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCollisionDetection } from "@/components/floor-plan/hooks/use-collision-detection";
import { makeFloorPlanItem } from "../helpers/factories";

describe("useCollisionDetection", () => {
  it("allows drag when no collisions", () => {
    const { result } = renderHook(() => useCollisionDetection());

    const items = [
      makeFloorPlanItem({ id: "item-1", x: 0, y: 0, width: 5, height: 5 }),
      makeFloorPlanItem({ id: "item-2", x: 20, y: 20, width: 5, height: 5 }),
    ];

    const check = result.current.checkDrag("item-1", 10, 10, items, 50, 50);
    expect(check.allowed).toBe(true);
  });

  it("blocks drag when out of bounds", () => {
    const { result } = renderHook(() => useCollisionDetection());

    const items = [
      makeFloorPlanItem({ id: "item-1", x: 0, y: 0, width: 5, height: 5 }),
    ];

    const check = result.current.checkDrag("item-1", 48, 48, items, 50, 50);
    expect(check.allowed).toBe(false);
  });

  it("snapBack returns to last valid position", () => {
    const { result } = renderHook(() => useCollisionDetection());

    const items = [
      makeFloorPlanItem({ id: "item-1", x: 10, y: 10, width: 5, height: 5 }),
    ];

    act(() => {
      result.current.savePosition("item-1", 10, 10);
    });

    const check = result.current.checkDrag("item-1", 48, 48, items, 50, 50);
    expect(check.allowed).toBe(false);
    expect(check.snapBackX).toBe(10);
    expect(check.snapBackY).toBe(10);
  });

  it("savePosition and getSavedPosition work together", () => {
    const { result } = renderHook(() => useCollisionDetection());

    act(() => {
      result.current.savePosition("item-1", 15, 25);
    });

    const pos = result.current.getSavedPosition("item-1");
    expect(pos).toEqual({ x: 15, y: 25 });
  });

  it("clearSavedPosition removes saved position", () => {
    const { result } = renderHook(() => useCollisionDetection());

    act(() => {
      result.current.savePosition("item-1", 15, 25);
      result.current.clearSavedPosition("item-1");
    });

    expect(result.current.getSavedPosition("item-1")).toBeUndefined();
  });

  it("getSavedPosition returns undefined for unknown item", () => {
    const { result } = renderHook(() => useCollisionDetection());
    expect(result.current.getSavedPosition("unknown")).toBeUndefined();
  });
});
