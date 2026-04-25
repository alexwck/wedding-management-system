"use client";

import { Rect } from "react-konva";
import type Konva from "konva";
import { FEET_TO_PIXELS, paddedRectHitFunc } from "@/lib/floor-plan/constants";
import { ItemLabel } from "./item-label";

interface MiscItemProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  customType?: string;
  draggable?: boolean;
  isSelected?: boolean;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onClick?: () => void;
  onDblClick?: () => void;
}

export function MiscItem({
  id,
  x,
  y,
  width,
  height,
  rotation,
  label,
  customType,
  draggable = false,
  isSelected = false,
  onDragEnd,
  onDragMove,
  onClick,
  onDblClick,
}: MiscItemProps) {
  const pixelWidth = width * FEET_TO_PIXELS;
  const pixelHeight = height * FEET_TO_PIXELS;
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
        fill="#f3e8ff"
        stroke={isSelected ? "#7e22ce" : "#a855f7"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={2}
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
        text={customType ?? label}
      />
    </>
  );
}
