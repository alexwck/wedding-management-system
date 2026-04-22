"use client";

import { useRef, useEffect } from "react";
import { Text } from "react-konva";
import type { Text as KonvaText } from "konva/lib/shapes/Text";

interface ItemLabelProps {
  id?: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  onDoubleClick?: () => void;
}

const MAX_LABEL_LENGTH = 15;

function truncateLabel(text: string): string {
  if (text.length <= MAX_LABEL_LENGTH) return text;
  return text.slice(0, MAX_LABEL_LENGTH - 1) + "…";
}

export function ItemLabel({
  id,
  text,
  x,
  y,
  width,
  height,
  rotation = 0,
  onDoubleClick,
}: ItemLabelProps) {
  const textRef = useRef<KonvaText>(null);
  const displayText = truncateLabel(text);

  const centerX = width !== undefined ? x + width / 2 : x;
  const centerY = height !== undefined ? y + height / 2 : y;

  useEffect(() => {
    const node = textRef.current;
    if (node) {
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
    }
  }, [displayText]);

  return (
    <Text
      ref={textRef}
      id={id}
      name="item-label"
      text={displayText}
      x={centerX}
      y={centerY}
      rotation={rotation}
      fontSize={12}
      fill="#374151"
      draggable={false}
      onDoubleClick={onDoubleClick}
    />
  );
}
