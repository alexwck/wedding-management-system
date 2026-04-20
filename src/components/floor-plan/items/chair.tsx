"use client";

import { Circle } from "react-konva";
import type Konva from "konva";
import { FEET_TO_PIXELS, DEFAULT_CHAIR_SIZE, paddedCircleHitFunc } from "@/lib/floor-plan/constants";
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
  const pixelX = (x + 0.5) * FEET_TO_PIXELS;
  const pixelY = (y + 0.5) * FEET_TO_PIXELS;
  const radius = (width / 2) * FEET_TO_PIXELS;

  return (
    <>
      <Circle
        id={id}
        x={pixelX}
        y={pixelY}
        radius={radius}
        rotation={rotation}
        fill="#f3e8ff"
        stroke={isSelected ? "#7c3aed" : "#a78bfa"}
        strokeWidth={isSelected ? 2 : 1}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
        hitFunc={paddedCircleHitFunc}
      />
      <ItemLabel
        x={x * FEET_TO_PIXELS}
        y={y * FEET_TO_PIXELS}
        width={width * FEET_TO_PIXELS}
        height={height * FEET_TO_PIXELS}
        text={label}
      />
    </>
  );
}
