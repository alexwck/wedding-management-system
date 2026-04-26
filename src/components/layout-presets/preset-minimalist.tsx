"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetMinimalist({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-minimalist">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
