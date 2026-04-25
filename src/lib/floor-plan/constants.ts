import type { ItemType, RoundTableSize, LongTableLength } from "@/types/floor-plan";
import type Konva from "konva";

export const FEET_TO_PIXELS = 20;
export const MAX_VENUE_DIMENSION = 300;
export const MAX_HISTORY_SIZE = 20;
export const AUTO_SAVE_DELAY_MS = 5000;
export const HIT_PADDING = 8;
export const ROTATION_SNAPS = Array.from({ length: 24 }, (_, i) => i * 15);

export function paddedRectHitFunc(ctx: Konva.Context, shape: Konva.Shape) {
  const w = shape.width() + HIT_PADDING * 2;
  const h = shape.height() + HIT_PADDING * 2;
  ctx.beginPath();
  ctx.rect(-HIT_PADDING, -HIT_PADDING, w, h);
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

export function paddedCircleHitFunc(ctx: Konva.Context, shape: Konva.Shape) {
  const circleShape = shape as Konva.Circle;
  const r = circleShape.radius() + HIT_PADDING;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

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

// Round table maxChairs already includes the "+1 over recommended" convention.
// E.g. 5ft round: recommended 7, max 8 (not 7+1=8 computed at runtime).
// Do not add +1 to maxChairs in getMaxChairCount() — the values are final.
export const ROUND_TABLE_SIZES: Record<RoundTableSize, Omit<RoundTableCatalogEntry, "type">> = {
  3: { diameter: 3, width: 3, height: 3, defaultChairs: 3, maxChairs: 4 },
  4: { diameter: 4, width: 4, height: 4, defaultChairs: 5, maxChairs: 6 },
  5: { diameter: 5, width: 5, height: 5, defaultChairs: 7, maxChairs: 8 },
  6: { diameter: 6, width: 6, height: 6, defaultChairs: 9, maxChairs: 10 },
  7: { diameter: 7, width: 7, height: 7, defaultChairs: 11, maxChairs: 12 },
};

export const LONG_TABLE_LENGTHS: Record<LongTableLength, Omit<LongTableCatalogEntry, "type">> = {
  6: { length: 6, width: 6, height: 2.5, defaultChairs: 7, maxChairs: 8 },
  7: { length: 7, width: 7, height: 2.5, defaultChairs: 9, maxChairs: 10 },
};

export const DEFAULT_CHAIR_SIZE = { width: 1, height: 1 };

export const DEFAULT_STAGE_SIZE = { width: 12, height: 8 };
export const DEFAULT_PILLAR_SIZE = { width: 2, height: 2 };
export const DEFAULT_WALKWAY_SIZE = { width: 6, height: 3 };
export const DEFAULT_MISC_SIZE = { width: 4, height: 4 };

export const RESIZE_BOUNDS: Record<string, { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }> = {
  stage: { minWidth: 4, maxWidth: 20, minHeight: 3, maxHeight: 20 },
  pillar: { minWidth: 1, maxWidth: 6, minHeight: 1, maxHeight: 6 },
  walkway: { minWidth: 2, maxWidth: 20, minHeight: 1, maxHeight: 10 },
  misc: { minWidth: 1, maxWidth: 15, minHeight: 1, maxHeight: 15 },
};

export function isResizable(type: ItemType): boolean {
  return type in RESIZE_BOUNDS;
}

export function getResizeBounds(type: ItemType) {
  return RESIZE_BOUNDS[type] ?? null;
}

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

export function isTableType(type: ItemType): type is "round_table" | "long_table" {
  return type === "round_table" || type === "long_table";
}

export function centerPixelsToTopLeftFeet(
  pixelX: number,
  pixelY: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: pixelX / FEET_TO_PIXELS - width / 2,
    y: pixelY / FEET_TO_PIXELS - height / 2,
  };
}

export function topLeftFeetToCenterPixels(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: (x + width / 2) * FEET_TO_PIXELS,
    y: (y + height / 2) * FEET_TO_PIXELS,
  };
}
