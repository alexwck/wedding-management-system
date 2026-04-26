"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetCardStack({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-card-stack">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
