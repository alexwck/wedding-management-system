"use client";

import { useState } from "react";
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

export function TemplatePreview({
  weddingId,
  imageUrl,
  focalX,
  focalY,
}: TemplatePreviewProps) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(
    focalX !== null && focalY !== null ? { x: focalX, y: focalY } : null,
  );
  const [saving, setSaving] = useState(false);

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoint({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }

  async function handleSave() {
    if (!point) return;
    setSaving(true);
    await updateTemplateFocalPoint(weddingId, point.x, point.y);
    setSaving(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props) => <Button variant="outline" size="sm" {...props} />}>
          Preview
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-3xl">
        <DialogHeader>
          <DialogTitle>Template Preview — Click to set focal point</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Template preview"
            className="w-full cursor-crosshair rounded-lg"
            onClick={handleImageClick}
          />
          {point && (
            <div
              className="absolute w-4 h-4 border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {point
              ? `Focal point: ${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%`
              : "Click the image to set a focal point"}
          </p>
          <Button size="sm" onClick={handleSave} disabled={!point || saving}>
            {saving ? "Saving..." : "Save Focal Point"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
