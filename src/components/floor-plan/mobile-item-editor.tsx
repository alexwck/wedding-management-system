"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trash2, X } from "lucide-react";
import type { FloorPlanItem } from "@/types/floor-plan";
import { isTableType } from "@/lib/floor-plan/constants";

interface MobileItemEditorProps {
  item: FloorPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRotate: (id: string, degrees: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onChairCountChange: (id: string, count: number) => void;
  maxChairs?: number;
  currentChairs?: number;
  onLabelChange?: (id: string, label: string) => void;
}

export function MobileItemEditor({
  item,
  isOpen,
  onClose,
  onRotate,
  onResize,
  onDelete,
  onChairCountChange,
  maxChairs,
  currentChairs,
  onLabelChange,
}: MobileItemEditorProps) {
  const [width, setWidth] = useState(item?.width ?? 1);
  const [height, setHeight] = useState(item?.height ?? 1);
  const [label, setLabel] = useState(item?.label ?? "");

  React.useEffect(() => {
    if (item) {
      setWidth(item.width);
      setHeight(item.height);
      setLabel(item.label ?? "");
    }
  }, [item]);

  if (!item) return null;

  const isTable = isTableType(item.type);
  const isResizable =
    item.type === "stage" ||
    item.type === "pillar" ||
    item.type === "walkway" ||
    item.type === "misc";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="glass-panel border-t border-white/20">
        <SheetHeader className="flex items-center justify-between pb-2 border-b border-white/10">
          <SheetTitle className="font-serif text-slate-800 text-base">
            Edit {item.label || item.type}
          </SheetTitle>
          <SheetClose>
            <button
              className="p-2 rounded-full hover:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="p-4 space-y-5">
          {/* Label editing */}
          {onLabelChange && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600 ml-1">Label</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={() => onLabelChange(item.id, label)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onLabelChange(item.id, label);
                    onClose();
                  }
                }}
                className="w-full h-10"
                maxLength={50}
              />
            </div>
          )}

          {/* Rotation */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Rotation</span>
            <div className="flex items-center gap-2">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => onRotate(item.id, -15)}
                className="min-w-[44px] min-h-[44px]"
              >
                <RotateCcw className="h-4 w-4" />
              </GlassButton>
              <span className="text-sm font-mono w-12 text-center">
                {Math.round(item.rotation || 0)}°
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => onRotate(item.id, 15)}
                className="min-w-[44px] min-h-[44px]"
              >
                <RotateCcw className="h-4 w-4 scale-x-[-1]" />
              </GlassButton>
            </div>
          </div>

          {/* Dimensions */}
          {isResizable && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">W</label>
              <Input
                type="number"
                min={1}
                max={300}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-20 h-10"
              />
              <label className="text-sm text-slate-600">H</label>
              <Input
                type="number"
                min={1}
                max={300}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-20 h-10"
              />
              <GlassButton
                size="sm"
                onClick={() => onResize(item.id, width, height)}
                className="min-h-[44px]"
              >
                Apply
              </GlassButton>
            </div>
          )}

          {/* Chair count */}
          {isTable && maxChairs !== undefined && currentChairs !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Chairs</span>
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onChairCountChange(item.id, currentChairs - 1)}
                  disabled={currentChairs <= 0}
                  className="min-w-[44px] min-h-[44px] text-lg"
                >
                  −
                </GlassButton>
                <span className="text-sm font-mono w-8 text-center">
                  {currentChairs}
                </span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onChairCountChange(item.id, currentChairs + 1)}
                  disabled={currentChairs >= maxChairs}
                  className="min-w-[44px] min-h-[44px] text-lg"
                >
                  +
                </GlassButton>
              </div>
            </div>
          )}

          {/* Delete */}
          <GlassButton
            variant="ghost"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="w-full text-destructive border border-destructive/20 min-h-[44px]"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Item
          </GlassButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
