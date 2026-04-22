import type { FloorPlanItem } from "@/types/floor-plan";

export function resolveSeatLabels(
  items: FloorPlanItem[],
  chairItemId: string,
  tableItemId: string,
): { tableName: string | null; seatLabel: string | null } {
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const tableItem = itemMap.get(tableItemId);
  const tableName = tableItem?.label ?? null;

  const chairItem = itemMap.get(chairItemId);
  if (chairItem?.metadata?.chairIndex != null) {
    return { tableName, seatLabel: `Seat ${chairItem.metadata.chairIndex + 1}` };
  }

  const siblings = items.filter(
    (i) => i.parentItemId === tableItemId && i.type === "chair",
  );
  const idx = siblings.findIndex((i) => i.id === chairItemId);
  return { tableName, seatLabel: idx >= 0 ? `Seat ${idx + 1}` : null };
}
