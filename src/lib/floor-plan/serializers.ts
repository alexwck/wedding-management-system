import type { FloorPlanItem, FloorPlanItemMetadata, FloorPlan } from "@/types/floor-plan";

interface DbFloorPlanItem {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  parentItemId: string | null;
  metadata: {
    diameter?: number;
    length?: number;
    chairIndex?: number;
    chairCount?: number;
    customType?: string;
  };
}

interface DbFloorPlan {
  id: number;
  wedding_id: number;
  width: number | string;
  height: number | string;
  items: DbFloorPlanItem[];
  created_at: string;
  updated_at: string;
}

export function serializeItem(item: FloorPlanItem): DbFloorPlanItem {
  return { ...item };
}

export function deserializeItem(dbItem: DbFloorPlanItem): FloorPlanItem {
  return {
    id: dbItem.id,
    type: dbItem.type as FloorPlanItem["type"],
    label: dbItem.label,
    x: dbItem.x,
    y: dbItem.y,
    width: dbItem.width,
    height: dbItem.height,
    rotation: dbItem.rotation,
    parentItemId: dbItem.parentItemId,
    metadata: dbItem.metadata as FloorPlanItemMetadata,
  };
}

export function serializeItems(items: DbFloorPlanItem[]): DbFloorPlanItem[] {
  return items.map((item) => ({ ...item }));
}

export function deserializeItems(dbItems: DbFloorPlanItem[]): FloorPlanItem[] {
  return dbItems.map(deserializeItem);
}

export function deserializeFloorPlan(db: DbFloorPlan): FloorPlan {
  return {
    id: db.id,
    weddingId: db.wedding_id,
    width: Number(db.width),
    height: Number(db.height),
    items: deserializeItems(db.items),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
