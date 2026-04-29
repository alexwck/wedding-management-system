"use client";

import type { LayoutPresetProps } from "@/lib/design-system/layout-preset-props";

export function PresetCinematic({ wedding }: LayoutPresetProps) {
  return (
    <div className="preset-cinematic">
      <h1 className="text-4xl font-light tracking-widest uppercase">{wedding.couple_name}</h1>
      {wedding.wedding_date && (
        <p className="text-xs tracking-widest uppercase text-white/60 mt-3">
          {new Date(wedding.wedding_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
