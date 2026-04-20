"use client";

import React, { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { ROTATION_SNAPS } from "@/lib/floor-plan/constants";

interface RotationTransformerProps {
  selectedItemId: string | null;
  stageRef: React.RefObject<Konva.Stage | null>;
  onRotationEnd: (itemId: string, rotation: number) => void;
}

export function RotationTransformer({
  selectedItemId,
  stageRef,
  onRotationEnd,
}: RotationTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    const node = selectedItemId ? stage.findOne(`#${selectedItemId}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedItemId, stageRef]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      resizeEnabled={false}
      enabledAnchors={[]}
      rotationSnaps={ROTATION_SNAPS}
      rotationSnapTolerance={5}
      rotateAnchorOffset={30}
      onTransformEnd={() => {
        const node = transformerRef.current?.nodes()[0];
        if (node && selectedItemId) {
          onRotationEnd(selectedItemId, node.rotation());
        }
      }}
    />
  );
}
