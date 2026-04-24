"use client";

import { useState, useCallback } from "react";
import type { FloorPlanItem, ItemType } from "@/types/floor-plan";
import {
  getDefaultChairs,
  isTableType,
  MAX_VENUE_DIMENSION,
  ROUND_TABLE_SIZES,
  LONG_TABLE_LENGTHS,
  DEFAULT_STAGE_SIZE,
  DEFAULT_PILLAR_SIZE,
  DEFAULT_WALKWAY_SIZE,
  DEFAULT_MISC_SIZE,
  DEFAULT_CHAIR_SIZE,
} from "@/lib/floor-plan/constants";
import type { RoundTableSize, LongTableLength } from "@/types/floor-plan";
import { generateChairsForTable } from "./use-chair-generation";
import { checkItemCollisions, isItemOutOfBounds } from "@/lib/floor-plan/collision";

const PLACEMENT_TEST_ID = "__placement_test__";

function getNextLabel(items: FloorPlanItem[], type: ItemType): string {
  const tableTypes: ItemType[] = ["round_table", "long_table"];
  const baseName =
    isTableType(type)
      ? "Table"
      : type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const existing = items.filter((i) =>
    tableTypes.includes(type)
      ? tableTypes.includes(i.type)
      : i.type === type,
  );
  return `${baseName} ${existing.length + 1}`;
}

function getDimensionsForType(
  type: ItemType,
  sizeVariant?: number,
): { width: number; height: number } {
  switch (type) {
    case "round_table": {
      const s = (sizeVariant ?? 5) as RoundTableSize;
      return { width: ROUND_TABLE_SIZES[s].width, height: ROUND_TABLE_SIZES[s].height };
    }
    case "long_table": {
      const l = (sizeVariant ?? 6) as LongTableLength;
      return { width: LONG_TABLE_LENGTHS[l].width, height: LONG_TABLE_LENGTHS[l].height };
    }
    case "chair":
      return DEFAULT_CHAIR_SIZE;
    case "stage":
      return DEFAULT_STAGE_SIZE;
    case "pillar":
      return DEFAULT_PILLAR_SIZE;
    case "walkway":
      return DEFAULT_WALKWAY_SIZE;
    case "misc":
      return DEFAULT_MISC_SIZE;
  }
}

function getTableMeta(type: ItemType, sizeVariant?: number): Record<string, unknown> {
  if (!isTableType(type)) return {};
  return {
    ...(type === "round_table" && sizeVariant
      ? { diameter: sizeVariant as RoundTableSize, chairCount: getDefaultChairs(type, sizeVariant) }
      : {}),
    ...(type === "long_table" && sizeVariant
      ? { length: sizeVariant as LongTableLength, chairCount: getDefaultChairs(type, sizeVariant) }
      : {}),
  };
}

export function useFloorPlanState(initialWidth: number, initialHeight: number) {
  const [items, setItems] = useState<FloorPlanItem[]>([]);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const addItem = useCallback(
    (type: ItemType, sizeVariant?: number) => {
      const dims = getDimensionsForType(type, sizeVariant);
      let item: FloorPlanItem | null = null;
      setItems((prev) => {
        const baseX = width / 2 - dims.width / 2;
        const baseY = height / 2 - dims.height / 2;

        let placeX = baseX;
        let placeY = baseY;

        // Check if center is collision-free; spiral outward if not
        const isTable = isTableType(type);
        if (type !== "chair") {
          const tableMeta = getTableMeta(type, sizeVariant);
          const testItem: FloorPlanItem = {
            id: PLACEMENT_TEST_ID,
            type,
            label: "",
            x: baseX,
            y: baseY,
            width: dims.width,
            height: dims.height,
            rotation: 0,
            parentItemId: null,
            metadata: tableMeta,
          };

          const isPositionValid = (x: number, y: number) => {
            const test = { ...testItem, x, y };
            if (isItemOutOfBounds(test, width, height)) return false;
            const allItems = [...prev, test];
            if (checkItemCollisions(PLACEMENT_TEST_ID, allItems).length > 0) return false;
            if (isTable) {
              const chairs = generateChairsForTable(test);
              for (const chair of chairs) {
                if (isItemOutOfBounds(chair, width, height)) return false;
                const withChair = [...allItems, chair];
                if (checkItemCollisions(chair.id, withChair).length > 0) return false;
              }
            }
            return true;
          };

          if (!isPositionValid(baseX, baseY)) {
            const step = 2;
            let found = false;
            for (let r = 1; r <= 10 && !found; r++) {
              const offsets = [
                [r * step, 0],
                [-r * step, 0],
                [0, r * step],
                [0, -r * step],
              ] as const;
              for (const [ox, oy] of offsets) {
                const cx = baseX + ox;
                const cy = baseY + oy;
                if (isPositionValid(cx, cy)) {
                  placeX = cx;
                  placeY = cy;
                  found = true;
                  break;
                }
              }
            }
          }
        }

        const tableMeta = getTableMeta(type, sizeVariant);

        const newItem: FloorPlanItem = {
          id: crypto.randomUUID(),
          type,
          label: getNextLabel(prev, type),
          x: placeX,
          y: placeY,
          width: dims.width,
          height: dims.height,
          rotation: 0,
          parentItemId: null,
          metadata: tableMeta,
        };
        item = newItem;
        const chairs =
          isTableType(type)
            ? generateChairsForTable(newItem)
            : [];
        return [...prev, newItem, ...chairs];
      });
      return item!;
    },
    [width, height],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id && i.parentItemId !== id));
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<FloorPlanItem, "id">>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      );
    },
    [],
  );

  const updateDimensions = useCallback(
    (newWidth: number, newHeight: number) => {
      const clampedWidth = Math.min(Math.max(newWidth, 1), MAX_VENUE_DIMENSION);
      const clampedHeight = Math.min(Math.max(newHeight, 1), MAX_VENUE_DIMENSION);
      setWidth(clampedWidth);
      setHeight(clampedHeight);
    },
    [],
  );

  const getOutOfBoundsItems = useCallback(
    (checkWidth = width, checkHeight = height) => {
      return items.filter((item) => {
        const { x, y, w, h } = getRotatedBounds(item);
        return x < 0 || y < 0 || x + w > checkWidth || y + h > checkHeight;
      });
    },
    [items, width, height],
  );

  const setAllItems = useCallback((newItems: FloorPlanItem[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    width,
    height,
    addItem,
    removeItem,
    updateItem,
    updateDimensions,
    getOutOfBoundsItems,
    setAllItems,
  };
}

function getRotatedBounds(item: FloorPlanItem) {
  const rad = (item.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w = item.width * cos + item.height * sin;
  const h = item.width * sin + item.height * cos;
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
