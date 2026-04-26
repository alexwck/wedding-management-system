"use client";

import React from "react";
import type { LayoutPresetProps } from "./layout-preset-props";

export type PresetName =
  | "minimalist"
  | "bento"
  | "storytelling"
  | "magazine"
  | "card-stack"
  | "asymmetric"
  | "cinematic";

const PresetMinimalist = React.lazy(() =>
  import("@/components/layout-presets/preset-minimalist").then((m) => ({
    default: m.PresetMinimalist,
  })),
);
const PresetBento = React.lazy(() =>
  import("@/components/layout-presets/preset-bento").then((m) => ({
    default: m.PresetBento,
  })),
);
const PresetStorytelling = React.lazy(() =>
  import("@/components/layout-presets/preset-storytelling").then((m) => ({
    default: m.PresetStorytelling,
  })),
);
const PresetMagazine = React.lazy(() =>
  import("@/components/layout-presets/preset-magazine").then((m) => ({
    default: m.PresetMagazine,
  })),
);
const PresetCardStack = React.lazy(() =>
  import("@/components/layout-presets/preset-card-stack").then((m) => ({
    default: m.PresetCardStack,
  })),
);
const PresetAsymmetric = React.lazy(() =>
  import("@/components/layout-presets/preset-asymmetric").then((m) => ({
    default: m.PresetAsymmetric,
  })),
);
const PresetCinematic = React.lazy(() =>
  import("@/components/layout-presets/preset-cinematic").then((m) => ({
    default: m.PresetCinematic,
  })),
);

function loadPresetCss(name: PresetName): Promise<void> {
  switch (name) {
    case "minimalist":
      return import("@/styles/presets/preset-minimalist.css").then(() => undefined);
    case "bento":
      return import("@/styles/presets/preset-bento.css").then(() => undefined);
    case "storytelling":
      return import("@/styles/presets/preset-storytelling.css").then(() => undefined);
    case "magazine":
      return import("@/styles/presets/preset-magazine.css").then(() => undefined);
    case "card-stack":
      return import("@/styles/presets/preset-card-stack.css").then(() => undefined);
    case "asymmetric":
      return import("@/styles/presets/preset-asymmetric.css").then(() => undefined);
    case "cinematic":
      return import("@/styles/presets/preset-cinematic.css").then(() => undefined);
    default:
      throw new Error(`Unknown preset: ${name}`);
  }
}

export const PRESET_REGISTRY: Record<
  PresetName,
  {
    component: React.ComponentType<LayoutPresetProps>;
    css: () => Promise<void>;
  }
> = {
  minimalist: { component: PresetMinimalist, css: () => loadPresetCss("minimalist") },
  bento: { component: PresetBento, css: () => loadPresetCss("bento") },
  storytelling: { component: PresetStorytelling, css: () => loadPresetCss("storytelling") },
  magazine: { component: PresetMagazine, css: () => loadPresetCss("magazine") },
  "card-stack": { component: PresetCardStack, css: () => loadPresetCss("card-stack") },
  asymmetric: { component: PresetAsymmetric, css: () => loadPresetCss("asymmetric") },
  cinematic: { component: PresetCinematic, css: () => loadPresetCss("cinematic") },
};

export function loadPreset(name: PresetName): Promise<void> {
  const preset = PRESET_REGISTRY[name];
  if (!preset) {
    throw new Error(`Unknown preset: ${name}`);
  }
  return preset.css();
}

export function preloadAllPresets(): Promise<void> {
  return Promise.all(Object.values(PRESET_REGISTRY).map((p) => p.css())).then(() => undefined);
}
