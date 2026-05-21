"use client";

import { useMemo } from "react";
import type { FloorPlanItem } from "@/types/floor-plan";
import type { SeatAssignmentMap } from "@/types/seat-assignment";
import { computeStats } from "@/lib/floor-plan/stats";

interface CanvasStatsProps {
  items: FloorPlanItem[];
  assignmentMap: SeatAssignmentMap;
}

export function CanvasStats({ items, assignmentMap }: CanvasStatsProps) {
  const stats = useMemo(
    () => computeStats(items, assignmentMap),
    [items, assignmentMap],
  );

  return (
    <div className="p-3 border-b text-xs space-y-1 glass-panel--light" data-testid="canvas-stats">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Tables</span>
        <span className="font-medium">
          {stats.roundTableCount} Round{stats.roundTableCount !== 1 ? "s" : ""}, {stats.longTableCount} Long{stats.longTableCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Chairs</span>
        <span className="font-medium">
          {stats.totalChairs} chair{stats.totalChairs !== 1 ? "s" : ""}
        </span>
      </div>
      {stats.totalChairs > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Assigned</span>
          <span className="font-medium">
            {stats.assignedChairs} assigned, {stats.emptyChairs} empty
          </span>
        </div>
      )}
    </div>
  );
}
