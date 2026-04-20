"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
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
import { Chair } from "./items/chair";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloorPlanToolbar } from "./floor-plan-toolbar";
import { RotationTransformer } from "./rotation-transformer";
import {
  FEET_TO_PIXELS,
  MAX_VENUE_DIMENSION,
} from "@/lib/floor-plan/constants";
import { isItemOutOfBounds } from "@/lib/floor-plan/collision";
import type { FloorPlan, FloorPlanItem, ItemType } from "@/types/floor-plan";
import { redistributeChairs, getMaxChairCount } from "./hooks/use-chair-generation";

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

  const isNewFloorPlan = !initialFloorPlan;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const [editingDimId, setEditingDimId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
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
        setContainerHeight(entry.contentRect.height);
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

  // Zoom: wheel centered on cursor
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = stage.scaleX();
    const scaleBy = 1.08;
    const newScale =
      e.evt.deltaY < 0
        ? Math.min(oldScale * scaleBy, 5)
        : Math.max(oldScale / scaleBy, 0.1);

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    setStageScale(newScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  // Pan: stage drag on empty space
  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (!stage || e.target !== stage) return;
      setStagePosition({ x: stage.x(), y: stage.y() });
    },
    [],
  );

  // Touch: pinch-to-zoom + two-finger pan
  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches.length !== 2) return;

      e.evt.preventDefault();

      const touch1 = touches[0];
      const touch2 = touches[1];
      const stage = stageRef.current;
      if (!stage) return;

      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      const stageRect = stage.container().getBoundingClientRect();
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2 - stageRect.left,
        y: (touch1.clientY + touch2.clientY) / 2 - stageRect.top,
      };

      if (lastTouchDist.current > 0 && lastTouchCenter.current) {
        const oldScale = stage.scaleX();

        const scaleFactor = dist / lastTouchDist.current;
        const newScale = Math.min(Math.max(oldScale * scaleFactor, 0.1), 5);

        const mousePointTo = {
          x: (center.x - stage.x()) / oldScale,
          y: (center.y - stage.y()) / oldScale,
        };

        const dx = center.x - lastTouchCenter.current.x;
        const dy = center.y - lastTouchCenter.current.y;

        setStageScale(newScale);
        setStagePosition({
          x: center.x - mousePointTo.x * newScale + dx,
          y: center.y - mousePointTo.y * newScale + dy,
        });
      }

      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
    },
    [],
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = 0;
    lastTouchCenter.current = null;
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.min(oldScale * 1.25, 5);
    const center = { x: stage.width() / 2, y: stage.height() / 2 };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    setStageScale(newScale);
    setStagePosition({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.max(oldScale / 1.25, 0.1);
    const center = { x: stage.width() / 2, y: stage.height() / 2 };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    setStageScale(newScale);
    setStagePosition({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 32;
    const availWidth = rect.width - padding;
    const availHeight = rect.height - padding;

    const scaleX = availWidth / canvasWidth;
    const scaleY = availHeight / canvasHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    const offsetX = (rect.width - canvasWidth * newScale) / 2;
    const offsetY = (rect.height - canvasHeight * newScale) / 2;

    setStageScale(newScale);
    setStagePosition({ x: offsetX, y: offsetY });
  }, [canvasWidth, canvasHeight]);

  const pushHistory = useCallback(() => {
    undoRedo.pushState(state.items, state.width, state.height);
  }, [undoRedo, state.items, state.width, state.height]);

  const handleSelectItem = useCallback(
    (type: ItemType, sizeVariant?: number) => {
      pushHistory();
      const item = state.addItem(type, sizeVariant);
      if (!item) return;
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
      const item = state.items.find((i) => i.id === id);
      if (!item) return;

      const dx = newX - item.x;
      const dy = newY - item.y;
      state.updateItem(id, { x: newX, y: newY });

      const isTable = item.type === "round_table" || item.type === "long_table";
      if (isTable && (dx !== 0 || dy !== 0)) {
        state.items
          .filter((i) => i.parentItemId === id)
          .forEach((child) => {
            state.updateItem(child.id, {
              x: child.x + dx,
              y: child.y + dy,
            });
          });
      }
    },
    [state],
  );

  const handleRotationEnd = useCallback(
    (itemId: string, rotation: number) => {
      pushHistory();
      state.updateItem(itemId, { rotation });
    },
    [pushHistory, state],
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
        const isTable = movedItem.type === "round_table" || movedItem.type === "long_table";
        if (isTable) {
          const dx = newX - movedItem.x;
          const dy = newY - movedItem.y;
          state.items
            .filter((i) => i.parentItemId === id)
            .forEach((child) => {
              const stage = stageRef.current;
              if (!stage) return;
              const childNode = stage.findOne(`#${child.id}`);
              if (childNode) {
                childNode.x((child.x + dx) * FEET_TO_PIXELS);
                childNode.y((child.y + dy) * FEET_TO_PIXELS);
              }
            });
        }
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
      state.updateItem(editingDimId, { [dim]: num });
    },
    [editingDimId, state],
  );

  const handleDimCommit = useCallback(() => {
    if (editingDimId) pushHistory();
  }, [editingDimId, pushHistory]);

  const handleChairCountChange = useCallback(
    (tableId: string, newCount: number) => {
      const table = state.items.find((i) => i.id === tableId);
      if (!table) return;
      const max = getMaxChairCount(table);
      const clamped = Math.min(Math.max(newCount, 0), max);
      pushHistory();

      const updatedTable = { ...table, metadata: { ...table.metadata, chairCount: clamped } };
      const newChairs = redistributeChairs(updatedTable, clamped);

      state.setAllItems([
        ...state.items.filter(
          (i) => i.id !== tableId && i.parentItemId !== tableId,
        ),
        updatedTable,
        ...newChairs,
      ]);
    },
    [state, pushHistory],
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
      case "chair":
        element = (
          <Chair
            {...commonProps}
            width={item.width}
            height={item.height}
            draggable={false}
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
          item.type === "round_table" || item.type === "chair" ? (
            <Circle
              x={(item.x + item.width / 2) * FEET_TO_PIXELS}
              y={(item.y + item.height / 2) * FEET_TO_PIXELS}
              radius={(item.width / 2) * FEET_TO_PIXELS}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth={2}
              dash={[4, 4]}
              listening={false}
            />
          ) : (
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
          )
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
        <div className="flex flex-wrap items-center gap-4 p-4 border-b">
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

          <div className="ml-4">
            <FloorPlanToolbar
              canUndo={undoRedo.canUndo()}
              canRedo={undoRedo.canRedo()}
              onUndo={handleUndo}
              onRedo={handleRedo}
              zoomPercent={stageScale * 100}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitToScreen={handleFitToScreen}
            />
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
              onBlur={handleDimCommit}
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
              onBlur={handleDimCommit}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">ft</span>
          </div>
        )}

        {/* Chair count adjustment for selected table */}
        {selectedItem &&
          (selectedItem.type === "round_table" ||
            selectedItem.type === "long_table") && (
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
              <span className="text-sm text-muted-foreground">Chairs:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleChairCountChange(
                    selectedItem.id,
                    (selectedItem.metadata.chairCount ?? 0) - 1,
                  )
                }
                disabled={(selectedItem.metadata.chairCount ?? 0) <= 0}
              >
                -
              </Button>
              <Input
                data-testid="chair-count-input"
                type="number"
                min={0}
                max={getMaxChairCount(selectedItem)}
                value={selectedItem.metadata.chairCount ?? 0}
                onChange={(e) =>
                  handleChairCountChange(
                    selectedItem.id,
                    Number(e.target.value),
                  )
                }
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleChairCountChange(
                    selectedItem.id,
                    (selectedItem.metadata.chairCount ?? 0) + 1,
                  )
                }
                disabled={
                  (selectedItem.metadata.chairCount ?? 0) >=
                  getMaxChairCount(selectedItem)
                }
              >
                +
              </Button>
              <span className="text-xs text-muted-foreground">
                (max {getMaxChairCount(selectedItem)})
              </span>
            </div>
          )}

        <div
          ref={containerRef}
          data-testid="floor-plan-canvas"
          className="flex-1 overflow-hidden bg-muted/30 relative"
        >
          {isNewFloorPlan && state.items.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-lg shadow-md px-8 py-6 text-center max-w-sm">
                <p className="text-lg font-medium">Design Your Floor Plan</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Set your venue dimensions above, then select items from the
                  catalog to start designing.
                </p>
              </div>
            </div>
          )}
          <Stage
            ref={stageRef}
            width={containerWidth}
            height={containerHeight}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable
            onClick={handleStageClick}
            onTap={handleStageClick as unknown as (evt: Konva.KonvaEventObject<TouchEvent>) => void}
            onDragEnd={handleStageDragEnd}
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
              <RotationTransformer
                selectedItemId={selectedItemId}
                stageRef={stageRef}
                onRotationEnd={handleRotationEnd}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
