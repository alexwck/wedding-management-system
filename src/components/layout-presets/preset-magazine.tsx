"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetMagazine({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-magazine">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
