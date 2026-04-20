"use client";

import { Rect } from "react-konva";
import type Konva from "konva";
import { FEET_TO_PIXELS, HIT_PADDING } from "@/lib/floor-plan/constants";
import { ItemLabel } from "./item-label";

interface PillarItemProps {
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

export function PillarItem({
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
}: PillarItemProps) {
  const pixelWidth = width * FEET_TO_PIXELS;
  const pixelHeight = height * FEET_TO_PIXELS;
  const pixelX = x * FEET_TO_PIXELS;
  const pixelY = y * FEET_TO_PIXELS;

  return (
    <>
      <Rect
        id={id}
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        rotation={rotation}
        fill="#e5e7eb"
        stroke={isSelected ? "#374151" : "#6b7280"}
        strokeWidth={isSelected ? 2 : 1}
        draggable={draggable}
        onDragEnd={onDragEnd}
        onDragMove={onDragMove}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
        hitFunc={(ctx, shape) => {
          const w = shape.width() + HIT_PADDING * 2;
          const h = shape.height() + HIT_PADDING * 2;
          ctx.beginPath();
          ctx.rect(-HIT_PADDING, -HIT_PADDING, w, h);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
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
