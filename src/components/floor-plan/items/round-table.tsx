"use client";

import { Circle } from "react-konva";
import type Konva from "konva";
import { FEET_TO_PIXELS } from "@/lib/floor-plan/constants";
import { ItemLabel } from "./item-label";

interface RoundTableProps {
  id: string;
  x: number;
  y: number;
  diameter: number;
  rotation: number;
  label: string;
  draggable?: boolean;
  isSelected?: boolean;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: () => void;
  onDblClick?: () => void;
}

export function RoundTable({
  id,
  x,
  y,
  diameter,
  rotation,
  label,
  draggable = false,
  isSelected = false,
  onDragEnd,
  onDragMove,
  onClick,
  onDblClick,
}: RoundTableProps) {
  const radius = (diameter / 2) * FEET_TO_PIXELS;
  const pixelX = x * FEET_TO_PIXELS;
  const pixelY = y * FEET_TO_PIXELS;

  return (
    <>
      <Circle
        id={id}
        x={pixelX}
        y={pixelY}
        radius={radius}
        rotation={rotation}
        fill="#dbeafe"
        stroke={isSelected ? "#1d4ed8" : "#3b82f6"}
        strokeWidth={isSelected ? 2 : 1}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
      />
      <ItemLabel x={pixelX} y={pixelY} text={label} rotation={0} />
    </>
  );
}
