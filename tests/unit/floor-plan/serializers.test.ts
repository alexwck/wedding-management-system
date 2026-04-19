import { describe, it, expect } from "vitest";
import {
  serializeItem,
  deserializeItem,
  serializeItems,
  deserializeItems,
  deserializeFloorPlan,
} from "@/lib/floor-plan/serializers";
import type { FloorPlanItem } from "@/types/floor-plan";

function makeItem(overrides: Partial<FloorPlanItem> = {}): FloorPlanItem {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    type: "round_table",
    label: "Round Table 1",
    x: 10,
    y: 20,
    width: 5,
    height: 5,
    rotation: 45,
    parentItemId: null,
    metadata: { diameter: 5, chairCount: 7 },
    ...overrides,
  };
}

describe("serializeItem", () => {
  it("converts camelCase item to snake_case DB format", () => {
    const item = makeItem();
    const result = serializeItem(item);
    expect(result.id).toBe(item.id);
    expect(result.type).toBe("round_table");
    expect(result.label).toBe("Round Table 1");
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
    expect(result.rotation).toBe(45);
    expect(result.parentItemId).toBeNull();
    expect(result.metadata.diameter).toBe(5);
    expect(result.metadata.chairCount).toBe(7);
  });

  it("preserves all item types", () => {
    for (const type of ["round_table", "long_table", "chair", "stage", "pillar", "walkway", "misc"] as const) {
      const item = makeItem({ type, metadata: {} });
      const result = serializeItem(item);
      expect(result.type).toBe(type);
    }
  });

  it("preserves parentItemId when set", () => {
    const item = makeItem({ parentItemId: "parent-uuid-123" });
    const result = serializeItem(item);
    expect(result.parentItemId).toBe("parent-uuid-123");
  });

  it("preserves customType metadata", () => {
    const item = makeItem({ type: "misc", metadata: { customType: "Bar" } });
    const result = serializeItem(item);
    expect(result.metadata.customType).toBe("Bar");
  });
});

describe("deserializeItem", () => {
  it("converts DB item to application type", () => {
    const dbItem = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "round_table",
      label: "Round Table 1",
      x: 10,
      y: 20,
      width: 5,
      height: 5,
      rotation: 45,
      parentItemId: null,
      metadata: { diameter: 5, chairCount: 7 },
    };
    const result = deserializeItem(dbItem);
    expect(result).toEqual(makeItem());
  });

  it("handles long table with length metadata", () => {
    const dbItem = {
      id: "uuid-1",
      type: "long_table",
      label: "Long Table 1",
      x: 0,
      y: 0,
      width: 6,
      height: 2.5,
      rotation: 0,
      parentItemId: null,
      metadata: { length: 6, chairCount: 7 },
    };
    const result = deserializeItem(dbItem);
    expect(result.type).toBe("long_table");
    expect(result.metadata.length).toBe(6);
  });

  it("handles chair with parentItemId", () => {
    const dbItem = {
      id: "chair-uuid",
      type: "chair",
      label: "Chair 1",
      x: 5,
      y: 5,
      width: 2,
      height: 2,
      rotation: 0,
      parentItemId: "table-uuid",
      metadata: { chairIndex: 0 },
    };
    const result = deserializeItem(dbItem);
    expect(result.parentItemId).toBe("table-uuid");
    expect(result.metadata.chairIndex).toBe(0);
  });
});

describe("serializeItems", () => {
  it("serializes an array of items", () => {
    const items = [
      makeItem({ id: "a" }),
      makeItem({ id: "b", type: "long_table", metadata: { length: 6 } }),
    ];
    const result = serializeItems(items);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
  });

  it("returns empty array for empty input", () => {
    expect(serializeItems([])).toEqual([]);
  });
});

describe("deserializeItems", () => {
  it("deserializes an array of DB items", () => {
    const dbItems = [
      {
        id: "a",
        type: "stage",
        label: "Stage 1",
        x: 0,
        y: 0,
        width: 12,
        height: 8,
        rotation: 0,
        parentItemId: null,
        metadata: {},
      },
    ];
    const result = deserializeItems(dbItems);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("stage");
  });
});

describe("deserializeFloorPlan", () => {
  it("converts DB floor plan to application format", () => {
    const dbPlan = {
      id: 1,
      wedding_id: 42,
      width: "50.00",
      height: "40.00",
      items: [
        {
          id: "item-1",
          type: "round_table",
          label: "Round Table 1",
          x: 10,
          y: 10,
          width: 5,
          height: 5,
          rotation: 0,
          parentItemId: null,
          metadata: { diameter: 5 },
        },
      ],
      created_at: "2026-04-19T00:00:00Z",
      updated_at: "2026-04-19T00:00:00Z",
    };
    const result = deserializeFloorPlan(dbPlan);
    expect(result.id).toBe(1);
    expect(result.weddingId).toBe(42);
    expect(result.width).toBe(50);
    expect(result.height).toBe(40);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe("round_table");
  });

  it("converts decimal string dimensions to numbers", () => {
    const dbPlan = {
      id: 2,
      wedding_id: 1,
      width: "100.50",
      height: "75.25",
      items: [],
      created_at: "2026-04-19T00:00:00Z",
      updated_at: "2026-04-19T00:00:00Z",
    };
    const result = deserializeFloorPlan(dbPlan);
    expect(result.width).toBe(100.5);
    expect(result.height).toBe(75.25);
  });

  it("handles empty items array", () => {
    const dbPlan = {
      id: 3,
      wedding_id: 1,
      width: 50,
      height: 40,
      items: [],
      created_at: "2026-04-19T00:00:00Z",
      updated_at: "2026-04-19T00:00:00Z",
    };
    const result = deserializeFloorPlan(dbPlan);
    expect(result.items).toEqual([]);
  });
});
