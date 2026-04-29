"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetCardStack({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-card-stack">
      <h1 className="text-3xl font-bold">{wedding.couple_name}</h1>
      {wedding.venue_name && (
        <p className="text-sm text-muted-foreground mt-1">{wedding.venue_name}</p>
      )}
    </div>
  );
}
