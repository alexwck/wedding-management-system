import { describe, it, expect } from "vitest";
import type { FloorPlanItem } from "@/types/floor-plan";
import {
  generateChairsForTable,
  getMaxChairCount,
} from "@/components/floor-plan/hooks/use-chair-generation";

describe("chair spacing", () => {
  describe("round table chair spacing", () => {
    it("produces >= 0.25 ft gap between adjacent chair edges for a 5ft round table with 7 chairs", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 10,
        y: 10,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 7 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs.length).toBe(7);

      for (let i = 0; i < chairs.length; i++) {
        const a = chairs[i];
        const b = chairs[(i + 1) % chairs.length];
        // Distance between chair centers
        const dx = (a.x + 0.5) - (b.x + 0.5);
        const dy = (a.y + 0.5) - (b.y + 0.5);
        const centerDist = Math.sqrt(dx * dx + dy * dy);
        // Min gap = centerDist - 2 * radius (each chair has radius 0.5)
        const gap = centerDist - 1;
        expect(gap).toBeGreaterThanOrEqual(0.25);
      }
    });

    it("produces >= 0.25 ft gap for a 3ft round table with 4 chairs", () => {
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
        metadata: { diameter: 3, chairCount: 4 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs.length).toBe(4);

      for (let i = 0; i < chairs.length; i++) {
        const a = chairs[i];
        const b = chairs[(i + 1) % chairs.length];
        const dx = (a.x + 0.5) - (b.x + 0.5);
        const dy = (a.y + 0.5) - (b.y + 0.5);
        const centerDist = Math.sqrt(dx * dx + dy * dy);
        const gap = centerDist - 1;
        expect(gap).toBeGreaterThanOrEqual(0.25);
      }
    });
  });

  describe("long table chair spacing", () => {
    it("produces >= 0.25 ft gap between adjacent chairs on a 6ft long table", () => {
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
      expect(chairs.length).toBe(7);

      const topChairs = chairs
        .filter((c) => c.y < table.y)
        .sort((a, b) => a.x - b.x);
      const bottomChairs = chairs
        .filter((c) => c.y > table.y)
        .sort((a, b) => a.x - b.x);

      const checkGap = (group: FloorPlanItem[]) => {
        for (let i = 1; i < group.length; i++) {
          const gap = group[i].x - group[i - 1].x - 1; // width=1
          expect(gap).toBeGreaterThanOrEqual(0.25);
        }
      };

      checkGap(topChairs);
      checkGap(bottomChairs);
    });

    it("produces >= 0.25 ft gap on a 7ft long table with 9 chairs", () => {
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
        metadata: { length: 7, chairCount: 9 },
      };

      const chairs = generateChairsForTable(table);
      expect(chairs.length).toBe(9);

      const topChairs = chairs
        .filter((c) => c.y < table.y)
        .sort((a, b) => a.x - b.x);

      for (let i = 1; i < topChairs.length; i++) {
        const gap = topChairs[i].x - topChairs[i - 1].x - 1;
        expect(gap).toBeGreaterThanOrEqual(0.25);
      }
    });
  });

  describe("max chair count", () => {
    it("long table 6ft has max = 8 (default 7)", () => {
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
      expect(getMaxChairCount(table)).toBe(8);
    });

    it("long table 7ft has max = 10 (default 9)", () => {
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
        metadata: { length: 7, chairCount: 9 },
      };
      expect(getMaxChairCount(table)).toBe(10);
    });

    it("round table 5ft has max = recommended + 1 (8)", () => {
      const table: FloorPlanItem = {
        id: "table-1",
        type: "round_table",
        label: "Round Table 1",
        x: 10,
        y: 10,
        width: 5,
        height: 5,
        rotation: 0,
        parentItemId: null,
        metadata: { diameter: 5, chairCount: 7 },
      };
      expect(getMaxChairCount(table)).toBe(8);
    });

    it("round table 3ft has max = recommended + 1 (4)", () => {
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
      expect(getMaxChairCount(table)).toBe(4);
    });
  });
});
