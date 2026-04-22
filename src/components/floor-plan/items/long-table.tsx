"use client";

import { Rect } from "react-konva";
import type Konva from "konva";

import { FEET_TO_PIXELS, paddedRectHitFunc } from "@/lib/floor-plan/constants";
import { ItemLabel } from "./item-label";

interface LongTableProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  draggable?: boolean;
  isSelected?: boolean;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: () => void;
  onDblClick?: () => void;
}

export function LongTable({
  id,
  x,
  y,
  width,
  height,
  rotation,
  label,
  draggable = false,
  isSelected = false,
  onDragEnd,
  onDragMove,
  onClick,
  onDblClick,
}: LongTableProps) {
  const pixelWidth = width * FEET_TO_PIXELS;
  const pixelHeight = height * FEET_TO_PIXELS;
  // Rect rotates around (x,y) — use center positioning + offset so rotation
  // happens around visual center instead of top-left corner
  const centerX = (x + width / 2) * FEET_TO_PIXELS;
  const centerY = (y + height / 2) * FEET_TO_PIXELS;

  return (
    <>
      <Rect
        id={id}
        x={centerX}
        y={centerY}
        width={pixelWidth}
        height={pixelHeight}
        offsetX={pixelWidth / 2}
        offsetY={pixelHeight / 2}
        rotation={rotation}
        fill="#fef3c7"
        stroke={isSelected ? "#d97706" : "#f59e0b"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={4}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
        hitFunc={paddedRectHitFunc}
      />
      <ItemLabel
        id={`${id}-label`}
        x={centerX}
        y={centerY}
        text={label}
      />
    </>
  );
}
