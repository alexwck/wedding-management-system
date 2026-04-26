import { describe, it, expect } from "vitest";
import { PRESET_REGISTRY, loadPreset, preloadAllPresets, type PresetName } from "@/lib/design-system/preset-loader";

describe("PRESET_REGISTRY", () => {
  it("contains all 7 preset names", () => {
    const expected: PresetName[] = [
      "minimalist",
      "bento",
      "storytelling",
      "magazine",
      "card-stack",
      "asymmetric",
      "cinematic",
    ];
    expect(Object.keys(PRESET_REGISTRY).sort()).toEqual(expected.sort());
  });

  it("each preset has a component", () => {
    for (const [, preset] of Object.entries(PRESET_REGISTRY)) {
      expect(preset.component).toBeDefined();
    }
  });

  it("each preset has a css loader function", () => {
    for (const [, preset] of Object.entries(PRESET_REGISTRY)) {
      expect(typeof preset.css).toBe("function");
    }
  });
});

describe("loadPreset", () => {
  it("returns a promise for a valid preset", () => {
    const promise = loadPreset("bento");
    expect(promise).toBeInstanceOf(Promise);
  });

  it("throws for invalid preset name", () => {
    expect(() => loadPreset("invalid" as PresetName)).toThrow();
  });
});

describe("preloadAllPresets", () => {
  it("returns a promise", () => {
    const promise = preloadAllPresets();
    expect(promise).toBeInstanceOf(Promise);
  });
});
