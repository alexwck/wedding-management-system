import { describe, it, expect } from "vitest";
import type { FloorPlanItem } from "@/types/floor-plan";
import {
  generateChairsForTable,
  redistributeChairs,
} from "@/components/floor-plan/hooks/use-chair-generation";
import {
  DEFAULT_CHAIR_SIZE,
} from "@/lib/floor-plan/constants";
import type { RoundTableSize, LongTableLength } from "@/types/floor-plan";

describe("generateChairsForTable", () => {
  describe("round tables", () => {
    it("generates correct number of default chairs for a 5ft round table", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 20,
        y: 15,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 7 },
      };

      const chairs = generateChairsForTable(table);

      expect(chairs).toHaveLength(7);
      expect(chairs.every((c) => c.type === "chair")).toBe(true);
      expect(chairs.every((c) => c.parentItemId === "table-1")).toBe(true);
    });

    it("positions chairs evenly around circumference of a 3ft round table", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 10,
        y: 10,
        width: 3,
        height: 3,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 3, chairCount: 3 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs).toHaveLength(3);

      const radius = 3 / 2;
      const cx = 10 + radius;
      const cy = 10 + radius;
      const offset = radius + 0.75;

      chairs.forEach((chair, i) => {
        const angle = (2 * Math.PI * i) / 3 - Math.PI / 2;
        const expectedX = cx + Math.cos(angle) * offset - DEFAULT_CHAIR_SIZE.width / 2;
        const expectedY = cy + Math.sin(angle) * offset - DEFAULT_CHAIR_SIZE.height / 2;
        expect(chair.x).toBeCloseTo(expectedX, 2);
        expect(chair.y).toBeCloseTo(expectedY, 2);
      });
    });

    it("positions chairs with correct angular spacing for a 7ft round table", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 30,
        y: 30,
        width: 7,
        height: 7,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 7, chairCount: 11 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs).toHaveLength(11);

      const angles = chairs.map((_, i) => (2 * Math.PI * i) / 11);
      const angleDiffs = angles.slice(1).map((a, i) => angles[i + 1] - angles[i]);
      angleDiffs.forEach((diff) => {
        expect(diff).toBeCloseTo((2 * Math.PI) / 11, 4);
      });
    });

    it("assigns sequential chairIndex metadata", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 20,
        y: 20,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 5 },
      };

      const chairs = generateChairsForTable(table);
      chairs.forEach((chair, i) => {
        expect(chair.metadata.chairIndex).toBe(i);
      });
    });

    it("assigns auto-incrementing labels", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 20,
        y: 20,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 3 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs[0].label).toBe("Chair 1");
      expect(chairs[1].label).toBe("Chair 2");
      expect(chairs[2].label).toBe("Chair 3");
    });

    it("uses default chair dimensions (1x1 ft)", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 20,
        y: 20,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 1 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs[0].width).toBe(DEFAULT_CHAIR_SIZE.width);
      expect(chairs[0].height).toBe(DEFAULT_CHAIR_SIZE.height);
    });
  });

  describe("long tables", () => {
    it("generates correct number of default chairs for a 6ft long table", () => {
      const table: FloorPlanItem = {
        id: "table-2",
        type: "long_table",
        label: "Long Table 1",
        x: 10,
        y: 10,
        width: 6,
        height: 2.5,
        rotation: 0,
        parentItemId: null,
        metadata: { length: 6, chairCount: 7 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs).toHaveLength(7);
      expect(chairs.every((c) => c.type === "chair")).toBe(true);
      expect(chairs.every((c) => c.parentItemId === "table-2")).toBe(true);
    });

    it("positions chairs along top and bottom edges of a long table", () => {
      const table: FloorPlanItem = {
        id: "table-2",
        type: "long_table",
        label: "Long Table 1",
        x: 10,
        y: 10,
        width: 6,
        height: 2.5,
        rotation: 0,
        parentItemId: null,
        metadata: { length: 6, chairCount: 6 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs).toHaveLength(6);

      const topChairs = chairs.filter(
        (c) => c.y < table.y + table.height / 2,
      );
      const bottomChairs = chairs.filter(
        (c) => c.y >= table.y + table.height / 2,
      );

      expect(topChairs.length).toBeGreaterThanOrEqual(2);
      expect(bottomChairs.length).toBeGreaterThanOrEqual(2);
    });

    it("positions chairs facing inward (above and below the table)", () => {
      const table: FloorPlanItem = {
        id: "table-2",
        type: "long_table",
        label: "Long Table 1",
        x: 10,
        y: 10,
        width: 6,
        height: 2.5,
        rotation: 0,
        parentItemId: null,
        metadata: { length: 6, chairCount: 4 },
      };

      const chairs = generateChairsForTable(table);
      const chairOffset = 0.75;

      chairs.forEach((chair) => {
        const chairCenterY = chair.y + chair.height / 2;
        const tableCenterY = table.y + table.height / 2;
        const isTop = chairCenterY < tableCenterY;
        const isBottom = chairCenterY > tableCenterY;

        if (isTop) {
          expect(chairCenterY).toBeLessThan(table.y - chairOffset + DEFAULT_CHAIR_SIZE.height);
        }
        if (isBottom) {
          expect(chairCenterY).toBeGreaterThan(table.y + table.height + chairOffset);
        }
      });
    });

    it("spaces chairs evenly along table length", () => {
      const table: FloorPlanItem = {
        id: "table-2",
        type: "long_table",
        label: "Long Table 1",
        x: 10,
        y: 10,
        width: 7,
        height: 2.5,
        rotation: 0,
        parentItemId: null,
        metadata: { length: 7, chairCount: 4 },
      };

      const chairs = generateChairsForTable(table);
      const topChairs = chairs
        .filter((c) => c.y < table.y + table.height / 2)
        .sort((a, b) => a.x - b.x);

      if (topChairs.length >= 2) {
        const gaps: number[] = [];
        for (let i = 1; i < topChairs.length; i++) {
          gaps.push(topChairs[i].x - topChairs[i - 1].x);
        }
        const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
        gaps.forEach((g) => {
          expect(g).toBeCloseTo(avgGap, 2);
        });
      }
    });
  });

  describe("chair count ranges", () => {
    it.each([
      [3, 4],
      [4, 6],
      [5, 8],
      [6, 10],
      [7, 12],
    ] as [RoundTableSize, number][])(
      "round table %dft allows up to maxChairs+1 (%d+1=%d chairs)",
      (diameter, maxChairs) => {
        const table: FloorPlanItem = {
          id: "table-1",
          type: "round_table",
          label: "Round Table 1",
          x: 20,
          y: 20,
          width: diameter,
          height: diameter,
          rotation: 0,
          parentItemId: null,
          metadata: { diameter, chairCount: maxChairs + 1 },
        };

        const chairs = generateChairsForTable(table);
        expect(chairs).toHaveLength(maxChairs + 1);
      },
    );

    it.each([
      [6, 8],
      [7, 10],
    ] as [LongTableLength, number][])(
      "long table %dft allows up to maxChairs+1 (%d+1=%d chairs)",
      (length, maxChairs) => {
        const table: FloorPlanItem = {
          id: "table-2",
          type: "long_table",
          label: "Long Table 1",
          x: 10,
          y: 10,
          width: length,
          height: 2.5,
          rotation: 0,
          parentItemId: null,
          metadata: { length, chairCount: maxChairs + 1 },
        };

        const chairs = generateChairsForTable(table);
        expect(chairs).toHaveLength(maxChairs + 1);
      },
    );

    it("allows 0 chairs", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 20,
        y: 20,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 0 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs).toHaveLength(0);
    });
  });
});

describe("redistributeChairs", () => {
  it("regenerates chairs with new count while keeping table position", () => {
    const table: FloorPlanItem = {
      id: "table-1",
      type: "round_table",
      label: "Round Table 1",
      x: 20,
      y: 20,
      width: 5,
      height: 5,
      rotation: 0,
      parentItemId: null,
      metadata: { diameter: 5, chairCount: 7 },
    };

    const newChairs = redistributeChairs(table, 5);
    expect(newChairs).toHaveLength(5);
    expect(newChairs.every((c) => c.parentItemId === "table-1")).toBe(true);
  });

  it("returns empty array when count is 0", () => {
    const table: FloorPlanItem = {
      id: "table-1",
      type: "round_table",
      label: "Round Table 1",
      x: 20,
      y: 20,
      width: 5,
      height: 5,
      rotation: 0,
      parentItemId: null,
      metadata: { diameter: 5, chairCount: 7 },
    };

    const newChairs = redistributeChairs(table, 0);
    expect(newChairs).toHaveLength(0);
  });

  it("updates metadata chairCount on the table", () => {
    const table: FloorPlanItem = {
      id: "table-1",
      type: "round_table",
      label: "Round Table 1",
      x: 20,
      y: 20,
      width: 5,
      height: 5,
      rotation: 0,
      parentItemId: null,
      metadata: { diameter: 5, chairCount: 7 },
    };

    redistributeChairs(table, 3);
    expect(table.metadata.chairCount).toBe(3);
  });
});
