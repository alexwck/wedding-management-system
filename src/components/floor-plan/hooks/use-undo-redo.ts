"use client";

import { useCallback, useRef, useState } from "react";
import type { FloorPlanItem } from "@/types/floor-plan";
import { MAX_HISTORY_SIZE } from "@/lib/floor-plan/constants";

interface Snapshot {
  items: FloorPlanItem[];
  width: number;
  height: number;
}

export function useUndoRedo() {
  const history = useRef<Snapshot[]>([]);
  const indexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < history.current.length - 1);
  }, []);

  const pushState = useCallback(
    (items: FloorPlanItem[], width: number, height: number) => {
      const snapshot: Snapshot = {
        items: structuredClone(items),
        width,
        height,
      };

      if (indexRef.current < history.current.length - 1) {
        history.current = history.current.slice(0, indexRef.current + 1);
      }

      history.current.push(snapshot);

      if (history.current.length > MAX_HISTORY_SIZE) {
        history.current = history.current.slice(-MAX_HISTORY_SIZE);
      }

      indexRef.current = history.current.length - 1;
      updateFlags();
    },
    [updateFlags],
  );

  const undo = useCallback((): Snapshot | null => {
    if (indexRef.current <= 0) return null;
    indexRef.current -= 1;
    updateFlags();
    return structuredClone(history.current[indexRef.current]);
  }, [updateFlags]);

  const redo = useCallback((): Snapshot | null => {
    if (indexRef.current >= history.current.length - 1) return null;
    indexRef.current += 1;
    updateFlags();
    return structuredClone(history.current[indexRef.current]);
  }, [updateFlags]);

  return { pushState, undo, redo, canUndo, canRedo };
}
