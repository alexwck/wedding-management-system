"use client";

import { Button } from "@/components/ui/button";

interface FloorPlanToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
}

export function FloorPlanToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
}: FloorPlanToolbarProps) {
  return (
    <div className="flex items-center gap-1 glass-panel rounded-lg px-2 py-1">
      <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
        Undo
      </Button>
      <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
        Redo
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="outline" size="sm" onClick={onZoomOut}>
        &minus;
      </Button>
      <span className="text-sm w-12 text-center tabular-nums">
        {Math.round(zoomPercent)}%
      </span>
      <Button variant="outline" size="sm" onClick={onZoomIn}>
        +
      </Button>
      <Button variant="outline" size="sm" onClick={onFitToScreen}>
        Fit
      </Button>
    </div>
  );
}
