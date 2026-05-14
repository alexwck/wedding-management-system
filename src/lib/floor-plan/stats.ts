import type { FloorPlanItem } from "@/types/floor-plan";
import type { SeatAssignmentMap } from "@/types/seat-assignment";

export interface CanvasStatsResult {
  roundTableCount: number;
  longTableCount: number;
  totalChairs: number;
  assignedChairs: number;
  emptyChairs: number;
}

export function computeStats(
  items: FloorPlanItem[],
  assignmentMap: SeatAssignmentMap,
): CanvasStatsResult {
  let roundTableCount = 0;
  let longTableCount = 0;
  let totalChairs = 0;
  let assignedChairs = 0;

  for (const item of items) {
    if (item.type === "round_table") {
      roundTableCount++;
    } else if (item.type === "long_table") {
      longTableCount++;
    } else if (item.type === "chair") {
      totalChairs++;
      if (assignmentMap[item.id]) {
        assignedChairs++;
      }
    }
  }

  return {
    roundTableCount,
    longTableCount,
    totalChairs,
    assignedChairs,
    emptyChairs: totalChairs - assignedChairs,
  };
}

export function getTableSummaryText(stats: CanvasStatsResult): string {
  const parts: string[] = [];
  if (stats.roundTableCount > 0) {
    parts.push(`${stats.roundTableCount} Round Table${stats.roundTableCount !== 1 ? "s" : ""}`);
  }
  if (stats.longTableCount > 0) {
    parts.push(`${stats.longTableCount} Long Table${stats.longTableCount !== 1 ? "s" : ""}`);
  }
  return parts.length > 0 ? parts.join(", ") : "0 Tables";
}

