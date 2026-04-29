import { describe, it, expect } from "vitest";
import { isTableType } from "@/lib/floor-plan/constants";
import { getMaxChairCount } from "@/components/floor-plan/hooks/use-chair-generation";
import type { FloorPlanItem } from "@/types/floor-plan";

describe("isTableType", () => {
  it("returns true for round_table", () => {
    expect(isTableType("round_table")).toBe(true);
  });

  it("returns true for long_table", () => {
    expect(isTableType("long_table")).toBe(true);
  });

  it("returns false for chair", () => {
    expect(isTableType("chair")).toBe(false);
  });

  it("returns false for stage", () => {
    expect(isTableType("stage")).toBe(false);
  });

  it("returns false for pillar", () => {
    expect(isTableType("pillar")).toBe(false);
  });

  it("returns false for walkway", () => {
    expect(isTableType("walkway")).toBe(false);
  });

  it("returns false for misc", () => {
    expect(isTableType("misc")).toBe(false);
  });
});

describe("getMaxChairCount", () => {
  it("returns correct max for 5ft round table", () => {
    const item: FloorPlanItem = {
      id: "test",
      type: "round_table",
      label: "Table 1",
      x: 0, y: 0,
      width: 5, height: 5,
      rotation: 0,
      parentItemId: null,
      metadata: { diameter: 5, chairCount: 7 },
    };
    expect(getMaxChairCount(item)).toBe(8);
  });

  it("returns correct max for 6ft long table", () => {
    const item: FloorPlanItem = {
      id: "test",
      type: "long_table",
      label: "Table 1",
      x: 0, y: 0,
      width: 6, height: 2.5,
      rotation: 0,
      parentItemId: null,
      metadata: { length: 6, chairCount: 7 },
    };
    expect(getMaxChairCount(item)).toBe(8);
  });

  it("returns correct max for 3ft round table", () => {
    const item: FloorPlanItem = {
      id: "test",
      type: "round_table",
      label: "Table 1",
      x: 0, y: 0,
      width: 3, height: 3,
      rotation: 0,
      parentItemId: null,
      metadata: { diameter: 3, chairCount: 3 },
    };
    expect(getMaxChairCount(item)).toBe(4);
  });
});
