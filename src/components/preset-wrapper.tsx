"use client";

import React from "react";
import type { PresetName } from "@/lib/design-system/preset-loader";

// Import all preset CSS files. Each file is small (~15KB max per spec),
// and importing them here ensures they are bundled and available.
import "@/styles/presets/preset-minimalist.css";
import "@/styles/presets/preset-bento.css";
import "@/styles/presets/preset-storytelling.css";
import "@/styles/presets/preset-magazine.css";
import "@/styles/presets/preset-card-stack.css";
import "@/styles/presets/preset-asymmetric.css";
import "@/styles/presets/preset-cinematic.css";

interface PresetWrapperProps {
  preset: PresetName;
  children: React.ReactNode;
}

export function PresetWrapper({ preset, children }: PresetWrapperProps) {
  return (
    <div data-preset={preset} className={`preset-${preset}`}>
      {children}
    </div>
  );
}
