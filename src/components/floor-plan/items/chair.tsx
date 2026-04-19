"use client";

import { Rect } from "react-konva";
import type Konva from "konva";
import { FEET_TO_PIXELS, DEFAULT_CHAIR_SIZE } from "@/lib/floor-plan/constants";
import { ItemLabel } from "./item-label";

interface ChairProps {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  label: string;
  draggable?: boolean;
  isSelected?: boolean;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: () => void;
  onDblClick?: () => void;
}

export function Chair({
  id,
  x,
  y,
  width = DEFAULT_CHAIR_SIZE.width,
  height = DEFAULT_CHAIR_SIZE.height,
  rotation = 0,
  label,
  draggable = false,
  isSelected = false,
  onDragEnd,
  onDragMove,
  onClick,
  onDblClick,
}: ChairProps) {
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
        fill="#f3e8ff"
        stroke={isSelected ? "#7c3aed" : "#a78bfa"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={3}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
      />
      <ItemLabel
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        rotation={rotation}
        text={label}
      />
    </>
  );
}
