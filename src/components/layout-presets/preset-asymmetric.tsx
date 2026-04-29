"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetAsymmetric({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-asymmetric">
      <h1 className="text-5xl font-extrabold tracking-tighter">{wedding.couple_name}</h1>
    </div>
  );
}
