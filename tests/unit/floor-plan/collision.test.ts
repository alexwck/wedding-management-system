import { describe, it, expect } from "vitest";
import type { FloorPlanItem } from "@/types/floor-plan";
import {
  rectRectCollision,
  circleCircleCollision,
  circleRectCollision,
  isItemOutOfBounds,
  checkItemCollisions,
} from "@/lib/floor-plan/collision";

function makeRectItem(overrides: Partial<FloorPlanItem> = {}): FloorPlanItem {
  return {
    id: "rect-1",
    type: "stage",
    label: "Stage 1",
    x: 10,
    y: 10,
    width: 5,
    height: 3,
    rotation: 0,
    parentItemId: null,
    metadata: {},
    ...overrides,
  };
}

function makeCircleItem(overrides: Partial<FloorPlanItem> = {}): FloorPlanItem {
  return {
    id: "circle-1",
    type: "round_table",
    label: "Round Table 1",
    x: 10,
    y: 10,
    width: 5,
    height: 5,
    rotation: 0,
    parentItemId: null,
    metadata: { diameter: 5 },
    ...overrides,
  };
}

describe("rectRectCollision", () => {
  it("detects overlap between two axis-aligned rectangles", () => {
    const a = makeRectItem({ x: 0, y: 0, width: 4, height: 4 });
    const b = makeRectItem({ x: 2, y: 2, width: 4, height: 4 });
    expect(rectRectCollision(a, b)).toBe(true);
  });

  it("detects no collision for separated rectangles", () => {
    const a = makeRectItem({ x: 0, y: 0, width: 4, height: 4 });
    const b = makeRectItem({ x: 5, y: 5, width: 4, height: 4 });
    expect(rectRectCollision(a, b)).toBe(false);
  });

  it("detects no collision for edge-touching rectangles", () => {
    const a = makeRectItem({ x: 0, y: 0, width: 4, height: 4 });
    const b = makeRectItem({ x: 4, y: 0, width: 4, height: 4 });
    expect(rectRectCollision(a, b)).toBe(false);
  });

  it("detects overlap with rotated rectangle using SAT", () => {
    const a = makeRectItem({ x: 5, y: 5, width: 6, height: 2, rotation: 0 });
    const b = makeRectItem({ x: 6, y: 5, width: 6, height: 2, rotation: 45 });
    expect(rectRectCollision(a, b)).toBe(true);
  });

  it("detects no collision for rotated non-overlapping rectangles", () => {
    const a = makeRectItem({ x: 0, y: 0, width: 4, height: 4, rotation: 45 });
    const b = makeRectItem({ x: 20, y: 20, width: 4, height: 4, rotation: 30 });
    expect(rectRectCollision(a, b)).toBe(false);
  });

  it("handles identical position as collision", () => {
    const a = makeRectItem({ x: 10, y: 10, width: 5, height: 3 });
    const b = makeRectItem({ x: 10, y: 10, width: 5, height: 3 });
    expect(rectRectCollision(a, b)).toBe(true);
  });
});

describe("circleCircleCollision", () => {
  it("detects overlap of two circles", () => {
    const a = makeCircleItem({ x: 10, y: 10, width: 5, height: 5 });
    const b = makeCircleItem({ x: 12, y: 10, width: 5, height: 5 });
    expect(circleCircleCollision(a, b)).toBe(true);
  });

  it("detects no collision for separated circles", () => {
    const a = makeCircleItem({ x: 0, y: 0, width: 4, height: 4 });
    const b = makeCircleItem({ x: 10, y: 10, width: 4, height: 4 });
    expect(circleCircleCollision(a, b)).toBe(false);
  });

  it("detects tangent circles as no collision", () => {
    const a = makeCircleItem({ x: 0, y: 0, width: 4, height: 4 });
    const b = makeCircleItem({ x: 4, y: 0, width: 4, height: 4 });
    expect(circleCircleCollision(a, b)).toBe(false);
  });

  it("handles different sized circles", () => {
    const a = makeCircleItem({ x: 0, y: 0, width: 6, height: 6 });
    const b = makeCircleItem({ x: 4, y: 0, width: 4, height: 4 });
    expect(circleCircleCollision(a, b)).toBe(true);
  });
});

describe("circleRectCollision", () => {
  it("detects overlap between circle and axis-aligned rectangle", () => {
    const circle = makeCircleItem({ x: 5, y: 5, width: 4, height: 4 });
    const rect = makeRectItem({ x: 6, y: 5, width: 4, height: 4 });
    expect(circleRectCollision(circle, rect)).toBe(true);
  });

  it("detects no collision for separated circle and rectangle", () => {
    const circle = makeCircleItem({ x: 0, y: 0, width: 4, height: 4 });
    const rect = makeRectItem({ x: 10, y: 10, width: 4, height: 4 });
    expect(circleRectCollision(rect, circle)).toBe(false);
  });

  it("detects overlap between circle and rotated rectangle", () => {
    const circle = makeCircleItem({ x: 5, y: 5, width: 4, height: 4 });
    const rect = makeRectItem({ x: 4, y: 4, width: 6, height: 2, rotation: 45 });
    expect(circleRectCollision(circle, rect)).toBe(true);
  });
});

describe("isItemOutOfBounds", () => {
  it("returns false for item fully within bounds", () => {
    const item = makeRectItem({ x: 1, y: 1, width: 5, height: 3, rotation: 0 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(false);
  });

  it("returns true for item extending past right edge", () => {
    const item = makeRectItem({ x: 48, y: 5, width: 5, height: 3 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(true);
  });

  it("returns true for item extending past bottom edge", () => {
    const item = makeRectItem({ x: 5, y: 48, width: 3, height: 5 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(true);
  });

  it("returns true for item with negative position", () => {
    const item = makeRectItem({ x: -2, y: 5, width: 4, height: 4 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(true);
  });

  it("accounts for rotation in boundary check", () => {
    const item = makeRectItem({ x: 47, y: 5, width: 6, height: 2, rotation: 45 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(true);
  });

  it("returns false for rotated item still within bounds", () => {
    const item = makeRectItem({ x: 10, y: 10, width: 4, height: 4, rotation: 45 });
    expect(isItemOutOfBounds(item, 50, 50)).toBe(false);
  });
});

describe("checkItemCollisions", () => {
  it("returns empty array when no collisions", () => {
    const items = [
      makeRectItem({ id: "a", x: 0, y: 0 }),
      makeRectItem({ id: "b", x: 20, y: 20 }),
    ];
    expect(checkItemCollisions("a", items)).toEqual([]);
  });

  it("returns IDs of colliding items", () => {
    const items = [
      makeRectItem({ id: "a", x: 0, y: 0, width: 5, height: 5 }),
      makeRectItem({ id: "b", x: 3, y: 3, width: 5, height: 5 }),
      makeRectItem({ id: "c", x: 20, y: 20, width: 5, height: 5 }),
    ];
    const collisions = checkItemCollisions("a", items);
    expect(collisions).toContain("b");
    expect(collisions).not.toContain("c");
  });

  it("handles mixed item types (circles and rectangles)", () => {
    const items = [
      makeCircleItem({ id: "a", x: 5, y: 5, width: 5, height: 5 }),
      makeRectItem({ id: "b", x: 6, y: 5, width: 4, height: 4 }),
    ];
    const collisions = checkItemCollisions("a", items);
    expect(collisions).toContain("b");
  });

  it("does not report collision with self", () => {
    const items = [
      makeRectItem({ id: "a", x: 0, y: 0, width: 5, height: 5 }),
    ];
    expect(checkItemCollisions("a", items)).toEqual([]);
  });

  it("does not report collision between parent and child items", () => {
    const items = [
      makeCircleItem({ id: "parent", x: 10, y: 10, width: 5, height: 5 }),
      makeRectItem({
        id: "child",
        x: 10,
        y: 10,
        width: 2,
        height: 2,
        parentItemId: "parent",
      }),
    ];
    expect(checkItemCollisions("parent", items)).toEqual([]);
  });
});
