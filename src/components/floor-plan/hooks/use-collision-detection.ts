"use client";

import { useRef, useCallback } from "react";
import type { FloorPlanItem } from "@/types/floor-plan";
import {
  checkItemCollisions,
  isItemOutOfBounds,
} from "@/lib/floor-plan/collision";

export function useCollisionDetection() {
  const lastValidPosition = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  const savePosition = useCallback((id: string, x: number, y: number) => {
    lastValidPosition.current.set(id, { x, y });
  }, []);

  const getSavedPosition = useCallback(
    (id: string) => lastValidPosition.current.get(id),
    [],
  );

  const clearSavedPosition = useCallback((id: string) => {
    lastValidPosition.current.delete(id);
  }, []);

  const checkDrag = useCallback(
    (
      itemId: string,
      newX: number,
      newY: number,
      items: FloorPlanItem[],
      planWidth: number,
      planHeight: number,
    ): { allowed: boolean; snapBackX?: number; snapBackY?: number } => {
      const outOfBounds = isItemOutOfBounds(
        { ...items.find((i) => i.id === itemId)!, x: newX, y: newY },
        planWidth,
        planHeight,
      );

      if (outOfBounds) {
        const saved = lastValidPosition.current.get(itemId);
        return {
          allowed: false,
          snapBackX: saved?.x ?? newX,
          snapBackY: saved?.y ?? newY,
        };
      }

      const collisions = checkItemCollisions(itemId, items);
      if (collisions.length > 0) {
        const saved = lastValidPosition.current.get(itemId);
        return {
          allowed: false,
          snapBackX: saved?.x ?? newX,
          snapBackY: saved?.y ?? newY,
        };
      }

      lastValidPosition.current.set(itemId, { x: newX, y: newY });
      return { allowed: true };
    },
    [],
  );

  return { savePosition, getSavedPosition, clearSavedPosition, checkDrag };
}
