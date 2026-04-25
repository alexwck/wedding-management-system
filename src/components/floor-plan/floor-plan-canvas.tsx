"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { useFloorPlanState } from "./hooks/use-floor-plan-state";
import { useAutoSave } from "./hooks/use-auto-save";
import { useCollisionDetection } from "./hooks/use-collision-detection";
import { useUndoRedo } from "./hooks/use-undo-redo";
import type { Snapshot } from "./hooks/use-undo-redo";
import { useSeatAssignments } from "./hooks/use-seat-assignments";
import { ItemCatalog } from "./item-catalog";
import { GuestAssignmentDialog } from "./guest-assignment-dialog";
import { GuestPanel } from "./guest-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloorPlanToolbar } from "./floor-plan-toolbar";
import { RotationTransformer } from "./rotation-transformer";
import type { TransformResult } from "./rotation-transformer";
import { CanvasItem } from "./canvas-item";
import {
  FEET_TO_PIXELS,
  MAX_VENUE_DIMENSION,
  isTableType,
  centerPixelsToTopLeftFeet,
  topLeftFeetToCenterPixels,
} from "@/lib/floor-plan/constants";
import { isItemOutOfBounds, checkItemCollisions } from "@/lib/floor-plan/collision";
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

function checkDragCollisions(
  id: string,
  hypothetical: FloorPlanItem,
  movedItem: FloorPlanItem,
  isTable: boolean,
  allItems: FloorPlanItem[],
  venueW: number,
  venueH: number,
): { blocked: boolean; hypotheticalItems: FloorPlanItem[] } {
  const hypotheticalItems = allItems.map((i) => (i.id === id ? hypothetical : i));
  const collisions = checkItemCollisions(id, hypotheticalItems);
  const oob = isItemOutOfBounds(hypothetical, venueW, venueH);

  if (!isTable || oob || collisions.length > 0) {
    return { blocked: oob || collisions.length > 0, hypotheticalItems };
  }

  const dx = hypothetical.x - movedItem.x;
  const dy = hypothetical.y - movedItem.y;
  const children = allItems.filter((i) => i.parentItemId === id);
  const hypotheticalChildren = children.map((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  const childMap = new Map(hypotheticalChildren.map((c) => [c.id, c]));
  const merged = hypotheticalItems.map((i) => childMap.get(i.id) ?? i);

  for (const hc of hypotheticalChildren) {
    if (isItemOutOfBounds(hc, venueW, venueH)) return { blocked: true, hypotheticalItems: merged };
    if (checkItemCollisions(hc.id, merged).length > 0) return { blocked: true, hypotheticalItems: merged };
  }

  return { blocked: false, hypotheticalItems: merged };
}

function ChairCountControls({
  tableId,
  count,
  max,
  onChange,
  onCommit,
}: {
  tableId: string;
  count: number;
  max: number;
  onChange: (tableId: string, count: number, isButton: boolean) => void;
  onCommit: () => void;
}) {
  return (
    <>
      <div className="w-px h-6 bg-border" />
      <span className="text-xs text-muted-foreground">Chairs:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(tableId, count - 1, true)}
        disabled={count <= 0}
        className="h-7 w-7 p-0"
      >
        -
      </Button>
      <Input
        data-testid="chair-count-input"
        type="number"
        min={0}
        max={max}
        value={count}
        onChange={(e) => onChange(tableId, Number(e.target.value), false)}
        onBlur={onCommit}
        className="w-14 h-7 text-xs text-center"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(tableId, count + 1, true)}
        disabled={count >= max}
        className="h-7 w-7 p-0"
      >
        +
      </Button>
      <span className="text-xs text-muted-foreground">/{max}</span>
    </>
  );
}

export function FloorPlanCanvas({
  weddingId,
  initialFloorPlan,
}: FloorPlanCanvasProps) {
  const initialWidth = initialFloorPlan?.width ?? DEFAULT_WIDTH;
  const initialHeight = initialFloorPlan?.height ?? DEFAULT_HEIGHT;

  const state = useFloorPlanState(initialWidth, initialHeight);
  const collision = useCollisionDetection();
  const undoRedo = useUndoRedo();
  const seatAssignments = useSeatAssignments(weddingId);

  const [dialogChairId, setDialogChairId] = useState<string | null>(null);
  const [dialogTableId, setDialogTableId] = useState<string | null>(null);

  const isNewFloorPlan = !initialFloorPlan;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const [editingDimId, setEditingDimId] = useState<string | null>(null);
  const venueEditStarted = useRef(false);
  const chairCountEditStarted = useRef(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const hasFittedRef = useRef(false);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const assignmentMapRef = useRef(seatAssignments.assignmentMap);
  assignmentMapRef.current = seatAssignments.assignmentMap;
  const unassignedGuestsRef = useRef(seatAssignments.unassignedGuests);
  unassignedGuestsRef.current = seatAssignments.unassignedGuests;
  const seatAssignmentsRef = useRef(seatAssignments);
  seatAssignmentsRef.current = seatAssignments;

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

  const outOfBoundsIds = useMemo(
    () => new Set(state.getOutOfBoundsItems().map((i) => i.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.items, state.width, state.height],
  );

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

  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (!stage || e.target !== stage) return;
      setStagePosition({ x: stage.x(), y: stage.y() });
    },
    [],
  );

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

  const handleZoom = useCallback((direction: "in" | "out") => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = direction === "in"
      ? Math.min(oldScale * 1.25, 5)
      : Math.max(oldScale / 1.25, 0.1);
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

  // Center canvas on initial load once container dimensions are measured
  useEffect(() => {
    if (!hasFittedRef.current && containerWidth > 0 && containerHeight > 0) {
      hasFittedRef.current = true;
      handleFitToScreen();
    }
  }, [containerWidth, containerHeight, handleFitToScreen]);

  const pushHistory = useCallback(() => {
    undoRedo.pushState(
      state.items,
      state.width,
      state.height,
      assignmentMapRef.current,
      unassignedGuestsRef.current,
    );
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

  const handleVenueDimChange = useCallback(
    (dim: "width" | "height", value: string) => {
      const num = Number(value);
      if (isNaN(num)) return;
      const clamped = Math.min(Math.max(num, 1), MAX_VENUE_DIMENSION);
      if (!venueEditStarted.current) {
        pushHistory();
        venueEditStarted.current = true;
      }
      state.updateDimensions(
        dim === "width" ? clamped : state.width,
        dim === "height" ? clamped : state.height,
      );
    },
    [pushHistory, state],
  );

  const handleVenueEditCommit = useCallback(() => {
    venueEditStarted.current = false;
  }, []);

  const handleDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const item = state.items.find((i) => i.id === id);
      if (!item) return;

      const { x: newX, y: newY } = centerPixelsToTopLeftFeet(node.x(), node.y(), item.width, item.height);

      const dx = newX - item.x;
      const dy = newY - item.y;
      if (dx === 0 && dy === 0) return;

      pushHistory();
      state.updateItem(id, { x: newX, y: newY });

      if (isTableType(item.type)) {
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
    [pushHistory, state],
  );

  const handleTransformEnd = useCallback(
    (itemId: string, result: TransformResult) => {
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return;

      pushHistory();

      const isTable = isTableType(item.type);

      if (!isTable) {
        state.updateItem(itemId, {
          x: result.x,
          y: result.y,
          width: result.width,
          height: result.height,
          rotation: result.rotation,
        });
        return;
      }

      const prevRotation = item.rotation;
      const delta = result.rotation - prevRotation;
      state.updateItem(itemId, { rotation: result.rotation });

      if (delta !== 0) {
        const tableCx = item.x + item.width / 2;
        const tableCy = item.y + item.height / 2;
        const rad = (delta * Math.PI) / 180;

        state.items
          .filter((i) => i.parentItemId === itemId)
          .forEach((child) => {
            const dx = (child.x + child.width / 2) - tableCx;
            const dy = (child.y + child.height / 2) - tableCy;
            const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
            const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
            const newCx = tableCx + rotatedX - child.width / 2;
            const newCy = tableCy + rotatedY - child.height / 2;
            state.updateItem(child.id, {
              x: newCx,
              y: newCy,
            });
          });
      }
    },
    [pushHistory, state],
  );

  const handleDragMove = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const movedItem = state.items.find((i) => i.id === id);
      if (!movedItem) return;

      const isTable = isTableType(movedItem.type);
      const { x: newX, y: newY } = centerPixelsToTopLeftFeet(node.x(), node.y(), movedItem.width, movedItem.height);

      const hypothetical = { ...movedItem, x: newX, y: newY };

      const dragResult = checkDragCollisions(
        id, hypothetical, movedItem, isTable, state.items, state.width, state.height,
      );

      const moveLabel = () => {
        const stage = stageRef.current;
        if (!stage) return;
        const label = stage.findOne(`#${id}-label`);
        if (label) {
          label.x(node.x());
          label.y(node.y());
        }
      };

      const snapBack = () => {
        const saved = collision.getSavedPosition(id);
        if (saved) {
          const restored = topLeftFeetToCenterPixels(saved.x, saved.y, movedItem.width, movedItem.height);
          node.x(restored.x);
          node.y(restored.y);
        }
        moveLabel();
      };

      if (dragResult.blocked) {
        snapBack();
      } else {
        collision.savePosition(id, newX, newY);
        moveLabel();
        if (isTable) {
          const dx = newX - movedItem.x;
          const dy = newY - movedItem.y;
          const stage = stageRef.current;
          if (!stage) return;
          state.items
            .filter((i) => i.parentItemId === id)
            .forEach((child) => {
              const childNode = stage.findOne(`#${child.id}`);
              if (childNode) {
                const center = topLeftFeetToCenterPixels(
                  child.x + dx, child.y + dy,
                  child.width, child.height,
                );
                childNode.x(center.x);
                childNode.y(center.y);
                const childLabel = stage.findOne(`#${child.id}-label`);
                if (childLabel) {
                  childLabel.x(center.x);
                  childLabel.y(center.y);
                }
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

    const sa = seatAssignmentsRef.current;
    const childChairs = state.items.filter(
      (item) => item.type === "chair" && item.parentItemId === selectedItemId,
    );
    for (const chair of childChairs) {
      if (sa.assignmentMap[chair.id]) {
        void sa.unassignGuest(chair.id);
      }
    }

    state.removeItem(selectedItemId);
    setSelectedItemId(null);
  }, [selectedItemId, pushHistory, state]);

  const dimEditStarted = useRef(false);

  const handleDimChange = useCallback(
    (dim: "width" | "height", value: string) => {
      if (!editingDimId) return;
      const num = Number(value);
      if (isNaN(num) || num <= 0) return;
      if (!dimEditStarted.current) {
        pushHistory();
        dimEditStarted.current = true;
      }
      state.updateItem(editingDimId, { [dim]: num });
    },
    [editingDimId, pushHistory, state],
  );

  const handleDimCommit = useCallback(() => {
    dimEditStarted.current = false;
  }, []);

  const handleChairCountChange = useCallback(
    (tableId: string, newCount: number, isButton: boolean) => {
      const table = state.items.find((i) => i.id === tableId);
      if (!table) return;
      const max = getMaxChairCount(table);
      const clamped = Math.min(Math.max(newCount, 0), max);
      if (isButton || !chairCountEditStarted.current) {
        pushHistory();
        chairCountEditStarted.current = true;
      }

      const updatedTable = { ...table, metadata: { ...table.metadata, chairCount: clamped } };
      const newChairs = redistributeChairs(updatedTable, clamped);
      const newChairIds = new Set(newChairs.map((c) => c.id));

      const sa = seatAssignmentsRef.current;
      const currentChairs = state.items.filter(
        (i) => i.type === "chair" && i.parentItemId === tableId,
      );
      for (const chair of currentChairs) {
        if (!newChairIds.has(chair.id) && sa.assignmentMap[chair.id]) {
          void sa.unassignGuest(chair.id);
        }
      }

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

  const handleChairCountCommit = useCallback(() => {
    chairCountEditStarted.current = false;
  }, []);

  const restoreSnapshot = useCallback(
    (snapshot: Snapshot | null) => {
      if (!snapshot) return;
      state.setAllItems(snapshot.items);
      state.updateDimensions(snapshot.width, snapshot.height);
      void seatAssignments.restoreAssignments(
        snapshot.assignmentMap,
        snapshot.unassignedGuests,
        snapshot.items,
      );
      setSelectedItemId(null);
    },
    [state, seatAssignments],
  );

  const handleUndo = useCallback(() => restoreSnapshot(undoRedo.undo()), [undoRedo, restoreSnapshot]);

  const handleRedo = useCallback(() => restoreSnapshot(undoRedo.redo()), [undoRedo, restoreSnapshot]);

  const handleGuestAssign = useCallback(
    async (rsvpId: number, chairItemId: string, tableItemId: string, guestName: string) => {
      pushHistory();
      return seatAssignments.assignGuest(rsvpId, chairItemId, tableItemId, guestName);
    },
    [pushHistory, seatAssignments],
  );

  const handleGuestUnassign = useCallback(
    async (chairItemId: string) => {
      pushHistory();
      return seatAssignments.unassignGuest(chairItemId);
    },
    [pushHistory, seatAssignments],
  );

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
      const stage = e.target.getStage();
      // Deselect when clicking on empty stage or the background Rect
      if (e.target === stage || e.target.attrs?.name === "background") {
        setSelectedItemId(null);
        setEditingLabelId(null);
        setEditingDimId(null);
      }
    },
    [],
  );

  const handleChairClick = useCallback((chairId: string, tableId: string) => {
    setDialogChairId(chairId);
    setDialogTableId(tableId);
  }, []);

  const SAVE_LABELS: Record<string, string> = {
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };
  const saveLabel = SAVE_LABELS[saveStatus] ?? "Unsaved";

  const selectedTableMaxChairs = selectedItem && isTableType(selectedItem.type)
    ? getMaxChairCount(selectedItem)
    : 0;
  const selectedChairCount = selectedItem?.metadata?.chairCount ?? 0;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar: guest panel */}
      <GuestPanel
        unassignedGuests={seatAssignments.unassignedGuests}
        assignmentMap={seatAssignments.assignmentMap}
        items={state.items}
        isLoading={seatAssignments.isLoading}
      />

      <div
        data-testid="floor-plan-canvas"
        className="flex-1 min-w-0 flex flex-col bg-muted/30 relative"
      >
        {/* Compact top bar */}
        <div className="h-10 shrink-0 glass-panel border-b flex items-center px-3 gap-3 z-30 rounded-none">
          {/* Venue dimensions */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="venue-width" className="text-xs font-medium">
              W
            </label>
            <Input
              id="venue-width"
              data-testid="venue-width"
              type="number"
              min={1}
              max={MAX_VENUE_DIMENSION}
              value={state.width}
              onChange={(e) => handleVenueDimChange("width", e.target.value)}
              onBlur={handleVenueEditCommit}
              className="w-14 h-7 text-xs"
            />
            <label htmlFor="venue-height" className="text-xs font-medium">
              H
            </label>
            <Input
              id="venue-height"
              data-testid="venue-height"
              type="number"
              min={1}
              max={MAX_VENUE_DIMENSION}
              value={state.height}
              onChange={(e) => handleVenueDimChange("height", e.target.value)}
              onBlur={handleVenueEditCommit}
              className="w-14 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">ft</span>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Undo / Redo / Zoom */}
          <FloorPlanToolbar
            canUndo={undoRedo.canUndo}
            canRedo={undoRedo.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoomPercent={stageScale * 100}
            onZoomIn={() => handleZoom("in")}
            onZoomOut={() => handleZoom("out")}
            onFitToScreen={handleFitToScreen}
          />

          {selectedItemId && (
            <>
              <div className="w-px h-6 bg-border" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-destructive"
              >
                Delete
              </Button>
            </>
          )}

          {selectedItem && isTableType(selectedItem.type) && (
            <ChairCountControls
              tableId={selectedItem.id}
              count={selectedChairCount}
              max={selectedTableMaxChairs}
              onChange={handleChairCountChange}
              onCommit={handleChairCountCommit}
            />
          )}

          <div className="flex-1" />

          {/* Save status */}
          <span
            data-testid="save-status"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            {saveLabel}
          </span>
          <button
            type="button"
            data-testid="save-now"
            onClick={saveNow}
            className="text-sm text-primary hover:underline whitespace-nowrap"
          >
            Save now
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 min-h-0 relative">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden"
        >
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
              name="background"
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="white"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            {state.items.map((item) => (
              <CanvasItem
                key={item.id}
                item={item}
                isSelected={item.id === selectedItemId}
                isOutOfBounds={outOfBoundsIds.has(item.id)}
                chairAssignment={seatAssignments.assignmentMap[item.id] ?? null}
                isSeatLoading={seatAssignments.isLoading}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                onSelect={setSelectedItemId}
                onDblClick={handleDblClickItem}
                onChairClick={handleChairClick}
              />
            ))}
            <RotationTransformer
              selectedItemId={selectedItemId}
              selectedItemType={selectedItem?.type ?? null}
              stageRef={stageRef}
              onTransformEnd={handleTransformEnd}
              venueWidth={state.width}
              venueHeight={state.height}
            />
          </Layer>
        </Stage>
        </div>

        {/* HTML overlays in separate stacking layer above canvas */}
        <div className="absolute inset-0 z-30" style={{ pointerEvents: "none" }}>

        {/* Out of bounds warning */}
        {outOfBoundsIds.size > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-md border border-yellow-500 bg-yellow-50 px-3 py-1 text-xs text-yellow-800">
            {outOfBoundsIds.size} item(s) outside bounds
          </div>
        )}

        {/* Inline label editing overlay */}
        {editingLabelId && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2" style={{ pointerEvents: "auto" }}>
            <div className="glass-panel rounded-lg shadow-lg p-2 flex gap-2">
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

        {/* Dimension editing overlay for selected configurable item */}
        {selectedItem && DIMENSION_EDITABLE_TYPES.includes(selectedItem.type) && (
          <div className="absolute bottom-2 right-2 glass-panel rounded-lg px-3 py-2 flex items-center gap-2" style={{ pointerEvents: "auto" }}>
            <span className="text-xs text-muted-foreground">
              {selectedItem.label}:
            </span>
            <label className="text-xs">W</label>
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
              className="w-16 h-7 text-xs"
            />
            <label className="text-xs">H</label>
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
              className="w-16 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">ft</span>
          </div>
        )}

        {isNewFloorPlan && state.items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-panel rounded-xl px-8 py-6 text-center max-w-sm">
              <p className="text-lg font-medium">Design Your Floor Plan</p>
              <p className="text-sm text-muted-foreground mt-2">
                Set your venue dimensions, then pick tables and items
                from the <strong>Item Catalog</strong> on the right to start
                designing your layout.
              </p>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>

      {/* Right sidebar: item catalog */}
      <ItemCatalog onSelectItem={handleSelectItem} />

      {/* Guest assignment dialog */}
      {dialogChairId && dialogTableId && (
        <GuestAssignmentDialog
          open={!!dialogChairId}
          onOpenChange={(open) => {
            if (!open) {
              setDialogChairId(null);
              setDialogTableId(null);
            }
          }}
          chairItemId={dialogChairId}
          currentGuestName={
            seatAssignments.assignmentMap[dialogChairId]?.guestName ?? null
          }
          unassignedGuests={seatAssignments.unassignedGuests}
          onAssign={handleGuestAssign}
          onUnassign={handleGuestUnassign}
          tableItemId={dialogTableId}
        />
      )}
    </div>
  );
}
