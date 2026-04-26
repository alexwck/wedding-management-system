"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetCinematic({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-cinematic">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
