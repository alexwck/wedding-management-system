import { describe, it, expect } from "vitest";
import { canPlaceItem } from "@/lib/floor-plan/placement";
import type { FloorPlanItem } from "@/types/floor-plan";
import { makeFloorPlanItem } from "../helpers/factories";

describe("canPlaceItem", () => {
  const venueW = 50;
  const venueH = 40;

  it("returns true on empty canvas", () => {
    expect(canPlaceItem("round_table", [], venueW, venueH)).toBe(true);
    expect(canPlaceItem("stage", [], venueW, venueH)).toBe(true);
    expect(canPlaceItem("pillar", [], venueW, venueH)).toBe(true);
  });

  it("returns false when canvas is too small for the item", () => {
    expect(canPlaceItem("round_table", [], 1, 1)).toBe(false);
    expect(canPlaceItem("stage", [], 1, 1)).toBe(false);
  });

  it("returns true when space exists despite existing items", () => {
    const item = makeFloorPlanItem({ id: "test-1", type: "round_table", x: 0, y: 0, width: 5, height: 5 });
    expect(canPlaceItem("pillar", [item], venueW, venueH)).toBe(true);
  });

  it("returns false when all positions overlap", () => {
    // Fill the center area so spiral can't find a spot for a 5ft round table
    const items: FloorPlanItem[] = [];
    const step = 5;
    for (let x = 0; x < venueW; x += step) {
      for (let y = 0; y < venueH; y += step) {
        items.push(
          makeFloorPlanItem({
            type: "stage",
            id: `fill-${x}-${y}`,
            x,
            y,
            width: step,
            height: step,
          }),
        );
      }
    }
    expect(canPlaceItem("round_table", items, venueW, venueH)).toBe(false);
  });

  it("respects size variant for round tables", () => {
    // 3ft round table + 3 default chairs fits in a 10x10 canvas
    expect(canPlaceItem("round_table", [], 10, 10, 3)).toBe(true);
    // 7ft round table + 11 default chairs is too big for a 5x5 canvas
    expect(canPlaceItem("round_table", [], 5, 5, 7)).toBe(false);
  });

  it("respects size variant for long tables", () => {
    // 6ft long table fits in a large canvas
    expect(canPlaceItem("long_table", [], 20, 20, 6)).toBe(true);
    // 7ft long table + chairs doesn't fit in tiny canvas
    expect(canPlaceItem("long_table", [], 3, 3, 7)).toBe(false);
  });
});
