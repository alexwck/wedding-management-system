"use client";

import React, { memo } from "react";
import type Konva from "konva";
import { Rect, Circle } from "react-konva";
import { RoundTable } from "./items/round-table";
import { LongTable } from "./items/long-table";
import { StageItem } from "./items/stage-item";
import { PillarItem } from "./items/pillar-item";
import { WalkwayItem } from "./items/walkway-item";
import { MiscItem } from "./items/misc-item";
import { Chair } from "./items/chair";
import {
  FEET_TO_PIXELS,
  topLeftFeetToCenterPixels,
} from "@/lib/floor-plan/constants";
import { truncate } from "@/lib/utils";
import type { FloorPlanItem } from "@/types/floor-plan";

interface CanvasItemProps {
  item: FloorPlanItem;
  isSelected: boolean;
  isOutOfBounds: boolean;
  isLocked: boolean;
  chairAssignment: { guestName: string } | null;
  isSeatLoading: boolean;
  onDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void;
  onSelect: (id: string) => void;
  onDblClick: (id: string) => void;
  onChairClick: (chairId: string, tableId: string) => void;
}

export const CanvasItem = memo(function CanvasItem({
  item,
  isSelected,
  isOutOfBounds,
  isLocked,
  chairAssignment,
  isSeatLoading,
  onDragEnd,
  onDragMove,
  onSelect,
  onDblClick,
  onChairClick,
}: CanvasItemProps) {
  const commonProps = {
    id: item.id,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    label: item.label,
    draggable: !isLocked,
    isSelected,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(item.id, e),
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(item.id, e),
    onClick: () => onSelect(item.id),
    onDblClick: () => onDblClick(item.id),
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
        <PillarItem {...commonProps} width={item.width} height={item.height} />
      );
      break;
    case "walkway":
      element = (
        <WalkwayItem {...commonProps} width={item.width} height={item.height} />
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
          assignment={chairAssignment ? truncate(chairAssignment.guestName, 15) : null}
          opacity={isSeatLoading ? 0.5 : 1}
          onClick={() => {
            if (item.parentItemId && !isSeatLoading) {
              onChairClick(item.id, item.parentItemId);
            }
          }}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <>
      {element}
      {isOutOfBounds && <OutOfBoundsIndicator item={item} />}
    </>
  );
});

function OutOfBoundsIndicator({ item }: { item: FloorPlanItem }) {
  const commonProps = {
    fill: "transparent" as const,
    stroke: "#ef4444",
    strokeWidth: 2,
    dash: [4, 4] as [number, number],
    listening: false,
  };

  if (item.type === "round_table" || item.type === "chair") {
    const center = topLeftFeetToCenterPixels(item.x, item.y, item.width, item.height);
    return (
      <Circle
        x={center.x}
        y={center.y}
        radius={(item.width / 2) * FEET_TO_PIXELS}
        {...commonProps}
      />
    );
  }

  const center = topLeftFeetToCenterPixels(item.x, item.y, item.width, item.height);

  return (
    <Rect
      x={center.x}
      y={center.y}
      width={item.width * FEET_TO_PIXELS}
      height={item.height * FEET_TO_PIXELS}
      offsetX={(item.width * FEET_TO_PIXELS) / 2}
      offsetY={(item.height * FEET_TO_PIXELS) / 2}
      rotation={item.rotation}
      {...commonProps}
    />
  );
}
