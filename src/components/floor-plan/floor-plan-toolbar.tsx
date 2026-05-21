"use client";

import { useState } from "react";
import { Undo2, Redo2, ZoomOut, ZoomIn, Maximize, Crosshair, HelpCircle, X } from "lucide-react";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

interface FloorPlanToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onCenterView?: () => void;
}

const SHORTCUTS = [
  { keys: "Ctrl + Z", action: "Undo" },
  { keys: "Ctrl + Shift + Z", action: "Redo" },
  { keys: "Delete", action: "Delete selected item" },
  { keys: "Ctrl + +", action: "Zoom in" },
  { keys: "Ctrl + -", action: "Zoom out" },
];

export function FloorPlanToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onCenterView,
}: FloorPlanToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <GlassButton variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} aria-label="Undo" className="min-w-[36px]">
        <Undo2 className="h-4 w-4" aria-hidden="true" />
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} aria-label="Redo" className="min-w-[36px]">
        <Redo2 className="h-4 w-4" aria-hidden="true" />
      </GlassButton>
      <div className="w-px h-6 bg-border mx-1" />
      <GlassButton variant="ghost" size="sm" onClick={onZoomOut} aria-label="Zoom out" className="min-w-[36px]">
        <ZoomOut className="h-4 w-4" aria-hidden="true" />
      </GlassButton>
      <span className="text-sm w-12 text-center tabular-nums">
        {Math.round(zoomPercent)}%
      </span>
      <GlassButton variant="ghost" size="sm" onClick={onZoomIn} aria-label="Zoom in" className="min-w-[36px]">
        <ZoomIn className="h-4 w-4" aria-hidden="true" />
      </GlassButton>
      <GlassButton variant="ghost" size="sm" onClick={onFitToScreen} aria-label="Fit to screen" className="min-w-[36px]">
        <Maximize className="h-4 w-4" aria-hidden="true" />
      </GlassButton>
      {onCenterView && (
        <GlassButton variant="ghost" size="sm" onClick={onCenterView} aria-label="Center on items" className="min-w-[36px]">
          <Crosshair className="h-4 w-4" aria-hidden="true" />
        </GlassButton>
      )}
      <div className="w-px h-6 bg-border mx-1" />
      <GlassButton variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)} aria-label="Keyboard shortcuts" className="min-w-[36px] hidden md:inline-flex">
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
      </GlassButton>

      {showHelp && (
        <div className="absolute top-12 right-4 z-[80]">
          <GlassPanel variant="light" className="p-4 w-64" padding="md" radius="md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-slate-800">Keyboard Shortcuts</h4>
              <button onClick={() => setShowHelp(false)} className="p-1 rounded hover:bg-white/30" aria-label="Close shortcuts">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {SHORTCUTS.map(({ keys, action }) => (
                <li key={keys} className="flex justify-between">
                  <span className="text-slate-500">{action}</span>
                  <kbd className="font-mono text-xs bg-white/30 px-1.5 py-0.5 rounded border border-white/20">{keys}</kbd>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
