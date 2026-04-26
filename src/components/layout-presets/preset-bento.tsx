"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetBento({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-bento">
      <h1>{wedding.couple_name}</h1>
    </div>
  );
}
