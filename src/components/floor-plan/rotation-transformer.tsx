"use client";

import React, { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { ROTATION_SNAPS, isResizable, getResizeBounds, FEET_TO_PIXELS, centerPixelsToTopLeftFeet } from "@/lib/floor-plan/constants";
import type { ItemType } from "@/types/floor-plan";

export interface TransformResult {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface RotationTransformerProps {
  selectedItemId: string | null;
  selectedItemType: ItemType | null;
  isLocked: boolean;
  stageRef: React.RefObject<Konva.Stage | null>;
  onTransformEnd: (itemId: string, result: TransformResult) => void;
  venueWidth?: number;
  venueHeight?: number;
  stageScale?: number;
}

export function RotationTransformer({
  selectedItemId,
  selectedItemType,
  isLocked,
  stageRef,
  onTransformEnd,
  venueWidth,
  venueHeight,
  stageScale = 1,
}: RotationTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  const canResize = selectedItemType ? isResizable(selectedItemType) : false;

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    const node = selectedItemId && !isLocked ? stage.findOne(`#${selectedItemId}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedItemId, stageRef, isLocked]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      resizeEnabled={canResize}
      anchorSize={Math.max(10 / stageScale, 15)}
      anchorStrokeWidth={Math.max(1 / stageScale, 0.5)}
      borderStrokeWidth={Math.max(1 / stageScale, 0.5)}
      rotateAnchorOffset={Math.max(30 / stageScale, 40)}
      enabledAnchors={canResize ? [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "middle-left",
        "middle-right",
        "top-center",
        "bottom-center",
      ] : []}
      boundBoxFunc={(oldBox, newBox) => {
        if (!canResize || !selectedItemType) return newBox;

        const bounds = getResizeBounds(selectedItemType);
        if (!bounds) return newBox;

        const newWidthFt = newBox.width / FEET_TO_PIXELS;
        const newHeightFt = newBox.height / FEET_TO_PIXELS;

        const clampedWidth = Math.min(Math.max(newWidthFt, bounds.minWidth), bounds.maxWidth);
        const clampedHeight = Math.min(Math.max(newHeightFt, bounds.minHeight), bounds.maxHeight);

        const maxW = venueWidth ? Math.min(clampedWidth, venueWidth) : clampedWidth;
        const maxH = venueHeight ? Math.min(clampedHeight, venueHeight) : clampedHeight;

        return {
          ...newBox,
          width: maxW * FEET_TO_PIXELS,
          height: maxH * FEET_TO_PIXELS,
        };
      }}
      rotationSnaps={ROTATION_SNAPS}
      rotationSnapTolerance={5}
      onTransformEnd={() => {
        const node = transformerRef.current?.nodes()[0];
        if (node && selectedItemId) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          const newWidth = (node.width() * scaleX) / FEET_TO_PIXELS;
          const newHeight = (node.height() * scaleY) / FEET_TO_PIXELS;
          const { x, y } = centerPixelsToTopLeftFeet(node.x(), node.y(), newWidth, newHeight);

          onTransformEnd(selectedItemId, {
            x,
            y,
            width: Math.round(newWidth * 100) / 100,
            height: Math.round(newHeight * 100) / 100,
            rotation: node.rotation(),
          });
        }
      }}
    />
  );
}
