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
import { GlassButton } from "@/components/glassmorphism/glass-button";

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

  // Sync with prop changes when dialog reopens or server data updates
  useEffect(() => {
    if (focalX !== null && focalY !== null) {
      setOffset({ x: focalX, y: focalY });
    } else {
      setOffset(null);
    }
  }, [focalX, focalY]);
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
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
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
      window.location.reload();
    } else {
      setSaving(false);
      setSaveError(result.error ?? "Failed to save crop position");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props) => <button {...props} type="button" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-2xl backdrop-blur-sm transition-all duration-300 bg-white/20 text-slate-800 hover:bg-white/30 border border-white/30" >Adjust Crop</button>}>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Adjust Image Crop</DialogTitle>
        </DialogHeader>
        <div
          className="relative overflow-hidden rounded-lg bg-black"
          style={{ aspectRatio: "3/2" }}
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
          {/* Visual crop guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/40" />
            <div className="absolute left-1/2 top-0 w-px h-full bg-white/40" />
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/60" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/60" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/60" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/60" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {offset
              ? `Crop offset: ${offset.x.toFixed(1)}%, ${offset.y.toFixed(1)}%`
              : "Drag the image to choose the visible portion"}
          </p>
          <GlassButton size="sm" onClick={handleSave} disabled={!offset || saving}>
            {saving ? "Saving..." : "Save Crop"}
          </GlassButton>
        </div>
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-rose-600">
            <span>Failed to save: {saveError}</span>
            <GlassButton variant="secondary" size="sm" onClick={handleSave}>
              Retry
            </GlassButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
