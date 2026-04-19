export const ITEM_TYPES = [
  "round_table",
  "long_table",
  "chair",
  "stage",
  "pillar",
  "walkway",
  "misc",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type RoundTableSize = 3 | 4 | 5 | 6 | 7;
export type LongTableLength = 6 | 7;

export interface FloorPlanItemMetadata {
  diameter?: RoundTableSize;
  length?: LongTableLength;
  chairIndex?: number;
  chairCount?: number;
  customType?: string;
}

export interface FloorPlanItem {
  id: string;
  type: ItemType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  parentItemId: string | null;
  metadata: FloorPlanItemMetadata;
}

export interface FloorPlan {
  id: number;
  weddingId: number;
  width: number;
  height: number;
  items: FloorPlanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FloorPlanInput {
  width: number;
  height: number;
  items: FloorPlanItem[];
}
