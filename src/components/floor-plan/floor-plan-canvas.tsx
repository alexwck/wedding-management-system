"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { useFloorPlanState } from "./hooks/use-floor-plan-state";
import { useAutoSave } from "./hooks/use-auto-save";
import { useCollisionDetection } from "./hooks/use-collision-detection";
import { useUndoRedo } from "./hooks/use-undo-redo";
import { ItemCatalog } from "./item-catalog";
import { RoundTable } from "./items/round-table";
import { LongTable } from "./items/long-table";
import { StageItem } from "./items/stage-item";
import { PillarItem } from "./items/pillar-item";
import { WalkwayItem } from "./items/walkway-item";
import { MiscItem } from "./items/misc-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FEET_TO_PIXELS,
  MAX_VENUE_DIMENSION,
} from "@/lib/floor-plan/constants";
import { isItemOutOfBounds } from "@/lib/floor-plan/collision";
import type { FloorPlan, FloorPlanItem, ItemType } from "@/types/floor-plan";

interface FloorPlanCanvasProps {
  weddingId: number;
  initialFloorPlan: FloorPlan | null;
}

const DEFAULT_WIDTH = 50;
const DEFAULT_HEIGHT = 40;

const DIMENSION_EDITABLE_TYPES: ItemType[] = [
  "stage",
  "pillar",
  "walkway",
  "misc",
];

export function FloorPlanCanvas({
  weddingId,
  initialFloorPlan,
}: FloorPlanCanvasProps) {
  const initialWidth = initialFloorPlan?.width ?? DEFAULT_WIDTH;
  const initialHeight = initialFloorPlan?.height ?? DEFAULT_HEIGHT;

  const state = useFloorPlanState(initialWidth, initialHeight);
  const collision = useCollisionDetection();
  const undoRedo = useUndoRedo();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const [editingDimId, setEditingDimId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFloorPlan?.items) {
      state.setAllItems(initialFloorPlan.items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const selectedItem = state.items.find((i) => i.id === selectedItemId) ?? null;

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

  const pushHistory = useCallback(() => {
    undoRedo.pushState(state.items, state.width, state.height);
  }, [undoRedo, state.items, state.width, state.height]);

  const handleSelectItem = useCallback(
    (type: ItemType, sizeVariant?: number) => {
      pushHistory();
      const item = state.addItem(type, sizeVariant);
      setSelectedItemId(item.id);
    },
    [pushHistory, state],
  );

  const handleWidthChange = useCallback(
    (value: string) => {
      const num = Number(value);
      if (isNaN(num)) return;
      const clamped = Math.min(Math.max(num, 1), MAX_VENUE_DIMENSION);
      state.updateDimensions(clamped, state.height);
    },
    [state],
  );

  const handleHeightChange = useCallback(
    (value: string) => {
      const num = Number(value);
      if (isNaN(num)) return;
      const clamped = Math.min(Math.max(num, 1), MAX_VENUE_DIMENSION);
      state.updateDimensions(state.width, clamped);
    },
    [state],
  );

  const handleDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x() / FEET_TO_PIXELS;
      const newY = node.y() / FEET_TO_PIXELS;
      state.updateItem(id, { x: newX, y: newY });
    },
    [state],
  );

  const handleDragMove = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x() / FEET_TO_PIXELS;
      const newY = node.y() / FEET_TO_PIXELS;

      const movedItem = state.items.find((i) => i.id === id);
      if (!movedItem) return;

      const hypothetical = { ...movedItem, x: newX, y: newY };
      const oob = isItemOutOfBounds(hypothetical, state.width, state.height);

      if (oob) {
        const saved = collision.getSavedPosition(id);
        if (saved) {
          node.x(saved.x * FEET_TO_PIXELS);
          node.y(saved.y * FEET_TO_PIXELS);
        }
      } else {
        collision.savePosition(id, newX, newY);
      }
    },
    [state, collision],
  );

  const handleDblClickItem = useCallback(
    (id: string) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      setEditingLabelId(id);
      setEditingLabelValue(item.label);
      setTimeout(() => editInputRef.current?.focus(), 50);
    },
    [state.items],
  );

  const commitLabelEdit = useCallback(() => {
    if (editingLabelId && editingLabelValue.trim()) {
      pushHistory();
      state.updateItem(editingLabelId, {
        label: editingLabelValue.trim(),
      });
    }
    setEditingLabelId(null);
    setEditingLabelValue("");
  }, [editingLabelId, editingLabelValue, pushHistory, state]);

  const handleDelete = useCallback(() => {
    if (!selectedItemId) return;
    pushHistory();
    state.removeItem(selectedItemId);
    setSelectedItemId(null);
  }, [selectedItemId, pushHistory, state]);

  const handleDimChange = useCallback(
    (dim: "width" | "height", value: string) => {
      if (!editingDimId) return;
      const num = Number(value);
      if (isNaN(num) || num <= 0) return;
      pushHistory();
      state.updateItem(editingDimId, { [dim]: num });
    },
    [editingDimId, pushHistory, state],
  );

  const handleUndo = useCallback(() => {
    const snapshot = undoRedo.undo();
    if (snapshot) {
      state.setAllItems(snapshot.items);
      state.updateDimensions(snapshot.width, snapshot.height);
      setSelectedItemId(null);
    }
  }, [undoRedo, state]);

  const handleRedo = useCallback(() => {
    const snapshot = undoRedo.redo();
    if (snapshot) {
      state.setAllItems(snapshot.items);
      state.updateDimensions(snapshot.width, snapshot.height);
      setSelectedItemId(null);
    }
  }, [undoRedo, state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingLabelId) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedItemId && !editingLabelId) handleDelete();
      }
      if (e.key === "Escape") {
        setSelectedItemId(null);
        setEditingLabelId(null);
        setEditingDimId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleDelete, editingLabelId, selectedItemId]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelectedItemId(null);
        setEditingLabelId(null);
        setEditingDimId(null);
      }
    },
    [],
  );

  const renderCanvasItem = (item: FloorPlanItem) => {
    const isSelected = item.id === selectedItemId;
    const isOutOfBounds = outOfBoundsIds.has(item.id);

    const commonProps = {
      id: item.id,
      x: item.x,
      y: item.y,
      rotation: item.rotation,
      label: item.label,
      draggable: true,
      isSelected,
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleDragEnd(item.id, e),
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) =>
        handleDragMove(item.id, e),
      onClick: () => setSelectedItemId(item.id),
      onDblClick: () => handleDblClickItem(item.id),
    };

    let element: React.ReactNode;

    switch (item.type) {
      case "round_table":
        element = (
          <RoundTable
            {...commonProps}
            diameter={item.metadata.diameter ?? item.width}
          />
        );
        break;
      case "long_table":
        element = (
          <LongTable {...commonProps} width={item.width} height={item.height} />
        );
        break;
      case "stage":
        element = (
          <StageItem {...commonProps} width={item.width} height={item.height} />
        );
        break;
      case "pillar":
        element = (
          <PillarItem
            {...commonProps}
            width={item.width}
            height={item.height}
          />
        );
        break;
      case "walkway":
        element = (
          <WalkwayItem
            {...commonProps}
            width={item.width}
            height={item.height}
          />
        );
        break;
      case "misc":
        element = (
          <MiscItem
            {...commonProps}
            width={item.width}
            height={item.height}
            customType={item.metadata.customType}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <React.Fragment key={item.id}>
        {element}
        {isOutOfBounds && (
          <Rect
            x={item.x * FEET_TO_PIXELS}
            y={item.y * FEET_TO_PIXELS}
            width={item.width * FEET_TO_PIXELS}
            height={item.height * FEET_TO_PIXELS}
            rotation={item.rotation}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth={2}
            dash={[4, 4]}
            listening={false}
          />
        )}
      </React.Fragment>
    );
  };

  const saveLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved";

  return (
    <div className="flex h-full">
      <ItemCatalog onSelectItem={handleSelectItem} />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
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

          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!undoRedo.canUndo()}
            >
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!undoRedo.canRedo()}
            >
              Redo
            </Button>
          </div>

          {selectedItemId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive"
            >
              Delete
            </Button>
          )}

          <span
            data-testid="save-status"
            className="text-sm text-muted-foreground ml-auto"
          >
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

        {outOfBoundsIds.size > 0 && (
          <div className="rounded-md border border-yellow-500 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 mx-4 mt-2">
            {outOfBoundsIds.size} item(s) are outside the floor plan bounds.
          </div>
        )}

        {/* Inline label editing overlay */}
        {editingLabelId && (
          <div className="absolute z-50" style={{ top: 60, left: 280 }}>
            <div className="bg-white border rounded shadow-lg p-2 flex gap-2">
              <input
                ref={editInputRef}
                value={editingLabelValue}
                onChange={(e) => setEditingLabelValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitLabelEdit();
                  if (e.key === "Escape") {
                    setEditingLabelId(null);
                    setEditingLabelValue("");
                  }
                }}
                onBlur={commitLabelEdit}
                className="border rounded px-2 py-1 text-sm w-40"
                maxLength={50}
              />
              <Button size="sm" onClick={commitLabelEdit}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Dimension editing panel for selected configurable item */}
        {selectedItem && DIMENSION_EDITABLE_TYPES.includes(selectedItem.type) && (
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
            <span className="text-sm text-muted-foreground">
              {selectedItem.label} dimensions:
            </span>
            <label className="text-sm">W</label>
            <Input
              type="number"
              min={1}
              max={MAX_VENUE_DIMENSION}
              value={selectedItem.width}
              onChange={(e) => {
                setEditingDimId(selectedItem.id);
                handleDimChange("width", e.target.value);
              }}
              className="w-20"
            />
            <label className="text-sm">H</label>
            <Input
              type="number"
              min={1}
              max={MAX_VENUE_DIMENSION}
              value={selectedItem.height}
              onChange={(e) => {
                setEditingDimId(selectedItem.id);
                handleDimChange("height", e.target.value);
              }}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">ft</span>
          </div>
        )}

        <div
          ref={containerRef}
          data-testid="floor-plan-canvas"
          className="flex-1 overflow-auto bg-muted/30 p-4"
        >
          <Stage
            ref={stageRef}
            width={Math.max(canvasWidth, containerWidth - 32)}
            height={canvasHeight}
            onClick={handleStageClick}
            onTap={handleStageClick as unknown as (evt: Konva.KonvaEventObject<TouchEvent>) => void}
          >
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
              {state.items.map(renderCanvasItem)}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
