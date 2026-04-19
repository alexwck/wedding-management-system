"use client";

import { useRef, useEffect } from "react";
import { Text } from "react-konva";
import type { Text as KonvaText } from "konva/lib/shapes/Text";

interface ItemLabelProps {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  onDoubleClick?: () => void;
}

export function ItemLabel({
  text,
  x,
  y,
  width,
  height,
  rotation = 0,
  onDoubleClick,
}: ItemLabelProps) {
  const textRef = useRef<KonvaText>(null);

  const centerX = width !== undefined ? x + width / 2 : x;
  const centerY = height !== undefined ? y + height / 2 : y;

  useEffect(() => {
    const node = textRef.current;
    if (node) {
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
    }
  }, [text]);

  return (
    <Text
      ref={textRef}
      text={text}
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
