"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveFloorPlan } from "@/app/actions/floor-plan";
import type { FloorPlanItem } from "@/types/floor-plan";
import { AUTO_SAVE_DELAY_MS } from "@/lib/floor-plan/constants";
import { isItemOutOfBounds } from "@/lib/floor-plan/collision";

export type SaveStatus = "unsaved" | "saving" | "saved" | "error" | "blocked";

interface UseAutoSaveOptions {
  weddingId: number;
  width: number;
  height: number;
  items: FloorPlanItem[];
  enabled?: boolean;
}

export function useAutoSave({
  weddingId,
  width,
  height,
  items,
  enabled = true,
}: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [blockedCount, setBlockedCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const itemsRef = useRef(items);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const snapshotRef = useRef(JSON.stringify({ width, height, items }));

  useEffect(() => {
    itemsRef.current = items;
    widthRef.current = width;
    heightRef.current = height;
  });

  const oobCount = items.filter((item) => isItemOutOfBounds(item, width, height)).length;

  const save = useCallback(async () => {
    if (!enabled) return;
    if (savingRef.current) return;

    const currentItems = itemsRef.current;
    const currentW = widthRef.current;
    const currentH = heightRef.current;
    const outOfBounds = currentItems.filter((item) => isItemOutOfBounds(item, currentW, currentH)).length;

    if (outOfBounds > 0) {
      setBlockedCount(outOfBounds);
      setSaveStatus("blocked");
      return;
    }

    savingRef.current = true;
    setSaveStatus("saving");
    const result = await saveFloorPlan(weddingId, {
      width: currentW,
      height: currentH,
      items: currentItems,
    });
    savingRef.current = false;

    if (result.success) {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      snapshotRef.current = JSON.stringify({ width: currentW, height: currentH, items: currentItems });
    } else {
      setSaveStatus("error");
    }
  }, [weddingId, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const currentSnapshot = JSON.stringify({ width, height, items });
    const hasChanged = currentSnapshot !== snapshotRef.current;

    if (oobCount > 0) {
      if (saveStatus !== "blocked" || blockedCount !== oobCount) {
        queueMicrotask(() => {
          setBlockedCount(oobCount);
          setSaveStatus("blocked");
        });
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      snapshotRef.current = currentSnapshot;
      return;
    }

    if (hasChanged && saveStatus !== "unsaved" && saveStatus !== "saving") {
      queueMicrotask(() => {
        setSaveStatus("unsaved");
      });
    }

    snapshotRef.current = currentSnapshot;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      save();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [width, height, items, enabled, save, oobCount, saveStatus, blockedCount]);

  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return save();
  }, [save]);

  return { saveStatus, lastSavedAt, saveNow, blockedCount };
}
