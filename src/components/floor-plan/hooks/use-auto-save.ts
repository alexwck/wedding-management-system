"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveFloorPlan } from "@/app/actions/floor-plan";
import type { FloorPlanItem } from "@/types/floor-plan";
import { AUTO_SAVE_DELAY_MS } from "@/lib/floor-plan/constants";

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const itemsRef = useRef(items);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  useEffect(() => {
    itemsRef.current = items;
    widthRef.current = width;
    heightRef.current = height;
  });

  const save = useCallback(async () => {
    if (!enabled) return;
    if (savingRef.current) return;

    savingRef.current = true;
    setSaveStatus("saving");
    const result = await saveFloorPlan(weddingId, {
      width: widthRef.current,
      height: heightRef.current,
      items: itemsRef.current,
    });
    savingRef.current = false;

    if (result.success) {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } else {
      setSaveStatus("error");
    }
  }, [weddingId, enabled]);

  useEffect(() => {
    if (!enabled) return;

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
  }, [width, height, items, enabled, save]);

  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return save();
  }, [save]);

  return { saveStatus, lastSavedAt, saveNow };
}
