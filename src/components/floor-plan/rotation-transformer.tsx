"use client";

import React, { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { ROTATION_SNAPS } from "@/lib/floor-plan/constants";

interface RotationTransformerProps {
  selectedItemId: string | null;
  stageRef: React.RefObject<Konva.Stage | null>;
  onRotationEnd: (itemId: string, rotation: number) => void;
  snapEnabled?: boolean;
}

export function RotationTransformer({
  selectedItemId,
  stageRef,
  onRotationEnd,
  snapEnabled = true,
}: RotationTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage || !selectedItemId) {
      tr?.nodes([]);
      tr?.getLayer()?.batchDraw();
      return;
    }

    const node = stage.findOne(`#${selectedItemId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedItemId, stageRef]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      resizeEnabled={false}
      enabledAnchors={[]}
      rotationSnaps={snapEnabled ? ROTATION_SNAPS : undefined}
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
