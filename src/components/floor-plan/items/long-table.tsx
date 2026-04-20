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
  const pixelX = x * FEET_TO_PIXELS;
  const pixelY = y * FEET_TO_PIXELS;
  const pixelWidth = width * FEET_TO_PIXELS;
  const pixelHeight = height * FEET_TO_PIXELS;

  return (
    <>
      <Rect
        id={id}
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
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
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        text={label}
      />
    </>
  );
}
