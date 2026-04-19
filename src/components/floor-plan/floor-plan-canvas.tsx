"use client";

import { Stage, Layer, Rect } from "react-konva";
import { useFloorPlanState } from "./hooks/use-floor-plan-state";
import { useAutoSave } from "./hooks/use-auto-save";
import { Input } from "@/components/ui/input";
import { FEET_TO_PIXELS, MAX_VENUE_DIMENSION } from "@/lib/floor-plan/constants";
import type { FloorPlan } from "@/types/floor-plan";

interface FloorPlanCanvasProps {
  weddingId: number;
  initialFloorPlan: FloorPlan | null;
}

const DEFAULT_WIDTH = 50;
const DEFAULT_HEIGHT = 40;

export function FloorPlanCanvas({ weddingId, initialFloorPlan }: FloorPlanCanvasProps) {
  const initialWidth = initialFloorPlan?.width ?? DEFAULT_WIDTH;
  const initialHeight = initialFloorPlan?.height ?? DEFAULT_HEIGHT;

  const state = useFloorPlanState(initialWidth, initialHeight);

  const { saveStatus, saveNow } = useAutoSave({
    weddingId,
    width: state.width,
    height: state.height,
    items: state.items,
  });

  const canvasWidth = state.width * FEET_TO_PIXELS;
  const canvasHeight = state.height * FEET_TO_PIXELS;

  const outOfBoundsIds = new Set(
    state.getOutOfBoundsItems().map((i) => i.id),
  );

  function handleWidthChange(value: string) {
    const num = Number(value);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(num, 1), MAX_VENUE_DIMENSION);
    state.updateDimensions(clamped, state.height);
  }

  function handleHeightChange(value: string) {
    const num = Number(value);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(num, 1), MAX_VENUE_DIMENSION);
    state.updateDimensions(state.width, clamped);
  }

  const saveLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved";

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="venue-width" className="text-sm font-medium">
            Width (ft)
          </label>
          <Input
            id="venue-width"
            data-testid="venue-width"
            type="number"
            min={1}
            max={MAX_VENUE_DIMENSION}
            value={state.width}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="venue-height" className="text-sm font-medium">
            Height (ft)
          </label>
          <Input
            id="venue-height"
            data-testid="venue-height"
            type="number"
            min={1}
            max={MAX_VENUE_DIMENSION}
            value={state.height}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="w-24"
          />
        </div>
        <span data-testid="save-status" className="text-sm text-muted-foreground ml-auto">
          {saveLabel}
        </span>
        <button
          type="button"
          onClick={saveNow}
          className="text-sm text-primary hover:underline"
        >
          Save now
        </button>
      </div>

      {/* Out-of-bounds warning */}
      {outOfBoundsIds.size > 0 && (
        <div className="rounded-md border border-yellow-500 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          {outOfBoundsIds.size} item(s) are outside the floor plan bounds.
        </div>
      )}

      {/* Canvas */}
      <div data-testid="floor-plan-canvas" className="border rounded-lg overflow-auto bg-muted/30">
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="white"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
