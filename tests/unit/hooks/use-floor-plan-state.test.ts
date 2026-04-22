import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFloorPlanState } from "@/components/floor-plan/hooks/use-floor-plan-state";

// Mock crypto.randomUUID for deterministic IDs
vi.stubGlobal("crypto", {
  randomUUID: vi.fn().mockReturnValue("test-uuid-1"),
});

describe("useFloorPlanState", () => {
  it("starts with empty items", () => {
    const { result } = renderHook(() => useFloorPlanState(50, 50));
    expect(result.current.items).toHaveLength(0);
    expect(result.current.width).toBe(50);
    expect(result.current.height).toBe(50);
  });

  it("addItem adds a stage item", () => {
    const { result } = renderHook(() => useFloorPlanState(100, 100));

    act(() => {
      result.current.addItem("stage");
    });

    expect(result.current.items.length).toBeGreaterThanOrEqual(1);
    expect(result.current.items[0].type).toBe("stage");
  });

  it("removeItem removes item and its children", () => {
    const { result } = renderHook(() => useFloorPlanState(100, 100));

    act(() => {
      result.current.addItem("stage");
    });
    const itemId = result.current.items[0].id;

    act(() => {
      result.current.removeItem(itemId);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("updateItem merges partial updates", () => {
    const { result } = renderHook(() => useFloorPlanState(100, 100));

    act(() => {
      result.current.addItem("stage");
    });
    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateItem(itemId, { label: "Main Stage" });
    });

    const updated = result.current.items.find((i) => i.id === itemId);
    expect(updated?.label).toBe("Main Stage");
  });

  it("updateDimensions clamps to MAX_VENUE_DIMENSION", () => {
    const { result } = renderHook(() => useFloorPlanState(50, 50));

    act(() => {
      result.current.updateDimensions(500, 500);
    });

    expect(result.current.width).toBe(300);
    expect(result.current.height).toBe(300);
  });

  it("updateDimensions clamps minimum to 1", () => {
    const { result } = renderHook(() => useFloorPlanState(50, 50));

    act(() => {
      result.current.updateDimensions(0, -5);
    });

    expect(result.current.width).toBe(1);
    expect(result.current.height).toBe(1);
  });

  it("getOutOfBoundsItems detects items outside bounds", () => {
    const { result } = renderHook(() => useFloorPlanState(50, 50));

    act(() => {
      result.current.setAllItems([
        {
          id: "in-bounds",
          type: "stage",
          label: "In",
          x: 5,
          y: 5,
          width: 10,
          height: 10,
          rotation: 0,
          parentItemId: null,
          metadata: {},
        },
        {
          id: "out-bounds",
          type: "stage",
          label: "Out",
          x: 45,
          y: 45,
          width: 10,
          height: 10,
          rotation: 0,
          parentItemId: null,
          metadata: {},
        },
      ]);
    });

    const oob = result.current.getOutOfBoundsItems();
    expect(oob).toHaveLength(1);
    expect(oob[0].id).toBe("out-bounds");
  });

  it("setAllItems replaces entire items array", () => {
    const { result } = renderHook(() => useFloorPlanState(50, 50));

    act(() => {
      result.current.addItem("stage");
    });
    expect(result.current.items.length).toBeGreaterThanOrEqual(1);

    act(() => {
      result.current.setAllItems([]);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("adding a round table also generates chairs", () => {
    const { result } = renderHook(() => useFloorPlanState(100, 100));

    let uuidCount = 0;
    vi.mocked(crypto.randomUUID).mockImplementation(() => `uuid-${++uuidCount}`);

    act(() => {
      result.current.addItem("round_table", 5);
    });

    const tableItem = result.current.items.find((i) => i.type === "round_table");
    const chairs = result.current.items.filter((i) => i.type === "chair");
    expect(tableItem).toBeDefined();
    expect(chairs.length).toBeGreaterThan(0);
    expect(chairs.every((c) => c.parentItemId === tableItem!.id)).toBe(true);
  });
});
