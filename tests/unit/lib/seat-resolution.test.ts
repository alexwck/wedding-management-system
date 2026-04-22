import { describe, it, expect } from "vitest";
import { resolveSeatLabels } from "@/lib/seat-resolution";
import type { FloorPlanItem } from "@/types/floor-plan";

const makeItem = (overrides: Partial<FloorPlanItem> & { id: string }): FloorPlanItem => ({
  type: "chair",
  label: "",
  x: 0,
  y: 0,
  width: 2,
  height: 2,
  rotation: 0,
  parentItemId: null,
  metadata: {},
  ...overrides,
});

describe("resolveSeatLabels", () => {
  it("returns null labels when no matching items exist", () => {
    const result = resolveSeatLabels([], "chair-1", "table-1");
    expect(result).toEqual({ tableName: null, seatLabel: null });
  });

  it("resolves table name from item label", () => {
    const items = [
      makeItem({ id: "table-1", type: "round_table", label: "Head Table" }),
    ];
    const result = resolveSeatLabels(items, "chair-1", "table-1");
    expect(result.tableName).toBe("Head Table");
  });

  it("resolves seat label from chairIndex metadata", () => {
    const items = [
      makeItem({ id: "chair-1", metadata: { chairIndex: 2 } }),
    ];
    const result = resolveSeatLabels(items, "chair-1", "table-1");
    expect(result.seatLabel).toBe("Seat 3");
  });

  it("falls back to sibling position when no chairIndex", () => {
    const items = [
      makeItem({ id: "chair-1", type: "chair", parentItemId: "table-1" }),
      makeItem({ id: "chair-2", type: "chair", parentItemId: "table-1" }),
      makeItem({ id: "chair-3", type: "chair", parentItemId: "table-1" }),
    ];
    const result = resolveSeatLabels(items, "chair-2", "table-1");
    expect(result.seatLabel).toBe("Seat 2");
  });

  it("returns null seatLabel when chair not found among siblings", () => {
    const items = [
      makeItem({ id: "chair-1", type: "chair", parentItemId: "table-1" }),
    ];
    const result = resolveSeatLabels(items, "chair-99", "table-1");
    expect(result.seatLabel).toBeNull();
  });

  it("resolves both table and seat together", () => {
    const items = [
      makeItem({ id: "table-1", type: "round_table", label: "Table A" }),
      makeItem({ id: "chair-1", type: "chair", parentItemId: "table-1", metadata: { chairIndex: 0 } }),
    ];
    const result = resolveSeatLabels(items, "chair-1", "table-1");
    expect(result).toEqual({ tableName: "Table A", seatLabel: "Seat 1" });
  });
});
