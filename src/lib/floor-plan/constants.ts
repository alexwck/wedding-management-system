import type { ItemType, RoundTableSize, LongTableLength } from "@/types/floor-plan";

export const FEET_TO_PIXELS = 20;
export const MAX_VENUE_DIMENSION = 300;
export const MAX_HISTORY_SIZE = 20;
export const AUTO_SAVE_DELAY_MS = 5000;

interface RoundTableCatalogEntry {
  type: "round_table";
  diameter: RoundTableSize;
  width: number;
  height: number;
  defaultChairs: number;
  maxChairs: number;
}

interface LongTableCatalogEntry {
  type: "long_table";
  length: LongTableLength;
  width: number;
  height: number;
  defaultChairs: number;
  maxChairs: number;
}

interface GenericCatalogEntry {
  type: Exclude<ItemType, "round_table" | "long_table" | "chair">;
  width: number;
  height: number;
}

interface ChairCatalogEntry {
  type: "chair";
  width: number;
  height: number;
}

export type CatalogEntry =
  | RoundTableCatalogEntry
  | LongTableCatalogEntry
  | GenericCatalogEntry
  | ChairCatalogEntry;

export const ROUND_TABLE_SIZES: Record<RoundTableSize, Omit<RoundTableCatalogEntry, "type">> = {
  3: { diameter: 3, width: 3, height: 3, defaultChairs: 3, maxChairs: 4 },
  4: { diameter: 4, width: 4, height: 4, defaultChairs: 5, maxChairs: 6 },
  5: { diameter: 5, width: 5, height: 5, defaultChairs: 7, maxChairs: 8 },
  6: { diameter: 6, width: 6, height: 6, defaultChairs: 9, maxChairs: 10 },
  7: { diameter: 7, width: 7, height: 7, defaultChairs: 11, maxChairs: 12 },
};

export const LONG_TABLE_LENGTHS: Record<LongTableLength, Omit<LongTableCatalogEntry, "type">> = {
  6: { length: 6, width: 6, height: 2.5, defaultChairs: 7, maxChairs: 7 },
  7: { length: 7, width: 7, height: 2.5, defaultChairs: 9, maxChairs: 9 },
};

export const DEFAULT_CHAIR_SIZE = { width: 1, height: 1 };

export const DEFAULT_STAGE_SIZE = { width: 12, height: 8 };
export const DEFAULT_PILLAR_SIZE = { width: 2, height: 2 };
export const DEFAULT_WALKWAY_SIZE = { width: 6, height: 3 };
export const DEFAULT_MISC_SIZE = { width: 4, height: 4 };

export const ITEM_CATALOG: CatalogEntry[] = [
  ...([3, 4, 5, 6, 7] as RoundTableSize[]).map(
    (d): RoundTableCatalogEntry => ({
      type: "round_table",
      ...ROUND_TABLE_SIZES[d],
    }),
  ),
  ...([6, 7] as LongTableLength[]).map(
    (l): LongTableCatalogEntry => ({
      type: "long_table",
      ...LONG_TABLE_LENGTHS[l],
    }),
  ),
  { type: "stage", ...DEFAULT_STAGE_SIZE },
  { type: "pillar", ...DEFAULT_PILLAR_SIZE },
  { type: "walkway", ...DEFAULT_WALKWAY_SIZE },
  { type: "misc", ...DEFAULT_MISC_SIZE },
  { type: "chair", ...DEFAULT_CHAIR_SIZE },
];

export function getDefaultChairs(type: ItemType, size?: number): number {
  if (type === "round_table" && size && size in ROUND_TABLE_SIZES) {
    return ROUND_TABLE_SIZES[size as RoundTableSize].defaultChairs;
  }
  if (type === "long_table" && size && size in LONG_TABLE_LENGTHS) {
    return LONG_TABLE_LENGTHS[size as LongTableLength].defaultChairs;
  }
  return 0;
}

export function getMaxChairs(type: ItemType, size?: number): number {
  if (type === "round_table" && size && size in ROUND_TABLE_SIZES) {
    return ROUND_TABLE_SIZES[size as RoundTableSize].maxChairs;
  }
  if (type === "long_table" && size && size in LONG_TABLE_LENGTHS) {
    return LONG_TABLE_LENGTHS[size as LongTableLength].maxChairs;
  }
  return 0;
}
