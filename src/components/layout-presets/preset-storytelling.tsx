"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetStorytelling({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-storytelling">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
