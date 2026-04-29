"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { updateTemplateFocalPoint } from "@/app/actions/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplatePreviewProps {
  weddingId: number;
  imageUrl: string;
  focalX: number | null;
  focalY: number | null;
}

interface CropOffset {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TemplatePreview({
  weddingId,
  imageUrl,
  focalX,
  focalY,
}: TemplatePreviewProps) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState<CropOffset | null>(
    focalX !== null && focalY !== null ? { x: focalX, y: focalY } : null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ clientX: 0, clientY: 0 });
  const offsetAtDragStart = useRef<CropOffset>({ x: 50, y: 50 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      dragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStart.current = { clientX, clientY };
      offsetAtDragStart.current = offset ?? { x: 50, y: 50 };
    },
    [offset],
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const img = imgRef.current;
      if (!img) return;

      const deltaX = clientX - dragStart.current.clientX;
      const deltaY = clientY - dragStart.current.clientY;
      const rect = img.getBoundingClientRect();

      const pxToPercentX = rect.width > 0 ? 100 / rect.width : 0;
      const pxToPercentY = rect.height > 0 ? 100 / rect.height : 0;

      const newX = clamp(
        offsetAtDragStart.current.x + deltaX * pxToPercentX,
        0,
        100,
      );
      const newY = clamp(
        offsetAtDragStart.current.y + deltaY * pxToPercentY,
        0,
        100,
      );

      setOffset({
        x: Math.round(newX * 100) / 100,
        y: Math.round(newY * 100) / 100,
      });
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();

      const img = imgRef.current;
      if (!img) return;

      const deltaX = e.clientX - dragStart.current.clientX;
      const deltaY = e.clientY - dragStart.current.clientY;
      const rect = img.getBoundingClientRect();

      const pxToPercentX = rect.width > 0 ? 100 / rect.width : 0;
      const pxToPercentY = rect.height > 0 ? 100 / rect.height : 0;

      const newX = clamp(
        offsetAtDragStart.current.x + deltaX * pxToPercentX,
        0,
        100,
      );
      const newY = clamp(
        offsetAtDragStart.current.y + deltaY * pxToPercentY,
        0,
        100,
      );

      setOffset({
        x: Math.round(newX * 100) / 100,
        y: Math.round(newY * 100) / 100,
      });
    };

    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [open]);

  async function handleSave() {
    if (!offset) return;
    setSaving(true);
    setSaveError(null);

    const result = await updateTemplateFocalPoint(weddingId, offset.x, offset.y);

    if (result.success) {
      setSaving(false);
      setOpen(false);
    } else {
      setSaving(false);
      setSaveError(result.error ?? "Failed to save crop position");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props) => <Button variant="outline" size="sm" {...props} />}>
          Adjust Crop
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adjust Image Crop</DialogTitle>
        </DialogHeader>
        <div
          className="relative overflow-hidden rounded-lg bg-black"
          style={{ aspectRatio: "16/9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Template preview"
            className="w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
            style={
              offset
                ? { objectPosition: `${offset.x}% ${offset.y}%` }
                : undefined
            }
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {offset
              ? `Crop offset: ${offset.x.toFixed(1)}%, ${offset.y.toFixed(1)}%`
              : "Drag the image to choose the visible portion"}
          </p>
          <Button size="sm" onClick={handleSave} disabled={!offset || saving}>
            {saving ? "Saving..." : "Save Crop"}
          </Button>
        </div>
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <span>Failed to save: {saveError}</span>
            <Button variant="outline" size="sm" onClick={handleSave}>
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
