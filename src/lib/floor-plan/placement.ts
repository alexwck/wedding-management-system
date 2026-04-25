import type { FloorPlanItem, ItemType } from "@/types/floor-plan";
import {
  isTableType,
  getDefaultChairs,
  ROUND_TABLE_SIZES,
  LONG_TABLE_LENGTHS,
  DEFAULT_STAGE_SIZE,
  DEFAULT_PILLAR_SIZE,
  DEFAULT_WALKWAY_SIZE,
  DEFAULT_MISC_SIZE,
} from "./constants";
import type { RoundTableSize, LongTableLength } from "@/types/floor-plan";
import { checkItemCollisions, isItemOutOfBounds } from "./collision";
import { generateChairsForTable } from "@/components/floor-plan/hooks/use-chair-generation";

const PLACEMENT_TEST_ID = "__placement_test__";

function getDimensions(type: ItemType, sizeVariant?: number): { width: number; height: number } {
  switch (type) {
    case "round_table": {
      const s = (sizeVariant ?? 5) as RoundTableSize;
      return { width: ROUND_TABLE_SIZES[s].width, height: ROUND_TABLE_SIZES[s].height };
    }
    case "long_table": {
      const l = (sizeVariant ?? 6) as LongTableLength;
      return { width: LONG_TABLE_LENGTHS[l].width, height: LONG_TABLE_LENGTHS[l].height };
    }
    case "stage":
      return DEFAULT_STAGE_SIZE;
    case "pillar":
      return DEFAULT_PILLAR_SIZE;
    case "walkway":
      return DEFAULT_WALKWAY_SIZE;
    case "misc":
      return DEFAULT_MISC_SIZE;
    default:
      return { width: 1, height: 1 };
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

/**
 * Checks whether an item of the given type can be placed on the canvas
 * without overlapping existing items or going out of bounds.
 */
export function canPlaceItem(
  type: ItemType,
  existingItems: FloorPlanItem[],
  venueWidth: number,
  venueHeight: number,
  sizeVariant?: number,
): boolean {
  const dims = getDimensions(type, sizeVariant);
  const baseX = venueWidth / 2 - dims.width / 2;
  const baseY = venueHeight / 2 - dims.height / 2;
  const isTable = isTableType(type);
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
    if (isItemOutOfBounds(test, venueWidth, venueHeight)) return false;
    const allItems = [...existingItems, test];
    if (checkItemCollisions(PLACEMENT_TEST_ID, allItems).length > 0) return false;
    if (isTable) {
      const chairs = generateChairsForTable(test);
      for (const chair of chairs) {
        if (isItemOutOfBounds(chair, venueWidth, venueHeight)) return false;
        const withChair = [...allItems, chair];
        if (checkItemCollisions(chair.id, withChair).length > 0) return false;
      }
    }
    return true;
  };

  if (isPositionValid(baseX, baseY)) return true;

  const step = 2;
  for (let r = 1; r <= 10; r++) {
    const offsets = [
      [r * step, 0],
      [-r * step, 0],
      [0, r * step],
      [0, -r * step],
    ] as const;
    for (const [ox, oy] of offsets) {
      if (isPositionValid(baseX + ox, baseY + oy)) return true;
    }
  }

  return false;
}
