"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface ViewportState {
  containerWidth: number;
  containerHeight: number;
  stageScale: number;
  stagePosition: { x: number; y: number };
  isMobile: boolean;
  isSmallScreen: boolean;
}

export function useCanvasViewport(canvasWidth: number, canvasHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ViewportState>({
    containerWidth: 800,
    containerHeight: 600,
    stageScale: 1,
    stagePosition: { x: 0, y: 0 },
    isMobile: false,
    isSmallScreen: false,
  });
  const hasFittedRef = useRef(false);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => {
      const isSmallScreen = window.innerWidth < 640;
      const isMobile = window.innerWidth < 768;
      setState((prev) => ({ ...prev, isMobile, isSmallScreen }));
    };
    check();
    const mql = window.matchMedia("(max-width: 767px)");
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  // ResizeObserver with debounced refit
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;

        setState((prev) => {
          // Bail out if dimensions haven't changed to avoid useless re-renders
          if (w === prev.containerWidth && h === prev.containerHeight) {
            return prev;
          }
          const deltaW = Math.abs(w - prev.containerWidth);
          const deltaH = Math.abs(h - prev.containerHeight);
          // Don't refit for minor changes (e.g., keyboard opening ~280px)
          const isMinor = deltaW < 200 && deltaH < 200 && hasFittedRef.current;
          if (isMinor) {
            return { ...prev, containerWidth: w, containerHeight: h };
          }
          return { ...prev, containerWidth: w, containerHeight: h };
        });

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const padding = 24;
          const availW = rect.width - padding;
          const availH = rect.height - padding;
          const scaleX = availW / canvasWidth;
          const scaleY = availH / canvasHeight;
          const newScale = Math.min(scaleX, scaleY, 1);
          const offsetX = (rect.width - canvasWidth * newScale) / 2;
          const offsetY = (rect.height - canvasHeight * newScale) / 2;

          setState((prev) => {
            // Skip if scale/position are already what we'd compute
            if (
              prev.stageScale === newScale &&
              prev.stagePosition.x === offsetX &&
              prev.stagePosition.y === offsetY
            ) {
              return prev;
            }
            return {
              ...prev,
              stageScale: newScale,
              stagePosition: { x: offsetX, y: offsetY },
            };
          });
          hasFittedRef.current = true;
        }, 150);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [canvasWidth, canvasHeight]);

  const zoomToNode = useCallback(
    (nodePixelX: number, nodePixelY: number, nodePixelW: number, nodePixelH: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetScale = Math.min(
        (rect.width * 0.6) / nodePixelW,
        (rect.height * 0.6) / nodePixelH,
        2 // max zoom
      );
      const offsetX = rect.width / 2 - (nodePixelX + nodePixelW / 2) * targetScale;
      const offsetY = rect.height / 2 - (nodePixelY + nodePixelH / 2) * targetScale;

      setState((prev) => ({
        ...prev,
        stageScale: targetScale,
        stagePosition: { x: offsetX, y: offsetY },
      }));
    },
    []
  );

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 24;
    const availW = rect.width - padding;
    const availH = rect.height - padding;
    const scaleX = availW / canvasWidth;
    const scaleY = availH / canvasHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    const offsetX = (rect.width - canvasWidth * newScale) / 2;
    const offsetY = (rect.height - canvasHeight * newScale) / 2;

    setState((prev) => {
      if (
        prev.stageScale === newScale &&
        prev.stagePosition.x === offsetX &&
        prev.stagePosition.y === offsetY
      ) {
        return prev;
      }
      return {
        ...prev,
        stageScale: newScale,
        stagePosition: { x: offsetX, y: offsetY },
      };
    });
  }, [canvasWidth, canvasHeight]);

  const setStageScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, stageScale: scale }));
  }, []);

  const setStagePosition = useCallback((pos: { x: number; y: number }) => {
    setState((prev) => ({ ...prev, stagePosition: pos }));
  }, []);

  const viewport = useMemo(
    () => ({
      ...state,
      containerRef,
      zoomToNode,
      handleFitToScreen,
      setStageScale,
      setStagePosition,
    }),
    [state, zoomToNode, handleFitToScreen, setStageScale, setStagePosition]
  );

  return viewport;
}
