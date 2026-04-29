"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetStorytelling({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-storytelling">
      <h1 className="text-4xl font-serif tracking-tight">{wedding.couple_name}</h1>
      {wedding.wedding_date && (
        <p className="text-sm text-muted-foreground mt-2">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
      )}
    </div>
  );
}
