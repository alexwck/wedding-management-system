"use client";

import { useCallback, useRef } from "react";
import type { FloorPlanItem } from "@/types/floor-plan";
import { MAX_HISTORY_SIZE } from "@/lib/floor-plan/constants";

interface Snapshot {
  items: FloorPlanItem[];
  width: number;
  height: number;
}

export function useUndoRedo() {
  const history = useRef<Snapshot[]>([]);
  const index = useRef(-1);

  const pushState = useCallback(
    (items: FloorPlanItem[], width: number, height: number) => {
      const snapshot: Snapshot = {
        items: structuredClone(items),
        width,
        height,
      };

      if (index.current < history.current.length - 1) {
        history.current = history.current.slice(0, index.current + 1);
      }

      history.current.push(snapshot);

      if (history.current.length > MAX_HISTORY_SIZE) {
        history.current = history.current.slice(-MAX_HISTORY_SIZE);
      }

      index.current = history.current.length - 1;
    },
    [],
  );

  const undo = useCallback((): Snapshot | null => {
    if (index.current <= 0) return null;
    index.current -= 1;
    return structuredClone(history.current[index.current]);
  }, []);

  const redo = useCallback((): Snapshot | null => {
    if (index.current >= history.current.length - 1) return null;
    index.current += 1;
    return structuredClone(history.current[index.current]);
  }, []);

  const canUndo = useCallback(() => index.current > 0, []);
  const canRedo = useCallback(
    () => index.current < history.current.length - 1,
    [],
  );

  return { pushState, undo, redo, canUndo, canRedo };
}
