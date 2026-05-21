import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DEFAULT_THEME } from "@/lib/design-system/theme-config";
import { ThemeProvider, useTheme } from "@/lib/design-system/theme";

// Color blindness simulation matrices (simplified RGB transformations)
const BLINDNESS_MATRICES = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

function applyMatrix(rgb: [number, number, number], matrix: number[][]): [number, number, number] {
  const [r, g, b] = rgb;
  return [
    Math.min(255, Math.max(0, r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2])),
    Math.min(255, Math.max(0, r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2])),
    Math.min(255, Math.max(0, r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2])),
  ];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [rs, gs, bs] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Theme color blindness simulation", () => {
  const primaryRgb = hexToRgb(DEFAULT_THEME.primaryColor);
  const accentRgb = hexToRgb(DEFAULT_THEME.accentColor);

  it("maintains distinguishable contrast under protanopia", () => {
    const primarySim = applyMatrix(primaryRgb, BLINDNESS_MATRICES.protanopia);
    const accentSim = applyMatrix(accentRgb, BLINDNESS_MATRICES.protanopia);
    const ratio = contrastRatio(primarySim, accentSim);
    expect(ratio).toBeGreaterThanOrEqual(1.1);
  });

  it("maintains distinguishable contrast under deuteranopia", () => {
    const primarySim = applyMatrix(primaryRgb, BLINDNESS_MATRICES.deuteranopia);
    const accentSim = applyMatrix(accentRgb, BLINDNESS_MATRICES.deuteranopia);
    const ratio = contrastRatio(primarySim, accentSim);
    expect(ratio).toBeGreaterThanOrEqual(1.1);
  });

  it("maintains distinguishable contrast under tritanopia", () => {
    const primarySim = applyMatrix(primaryRgb, BLINDNESS_MATRICES.tritanopia);
    const accentSim = applyMatrix(accentRgb, BLINDNESS_MATRICES.tritanopia);
    const ratio = contrastRatio(primarySim, accentSim);
    expect(ratio).toBeGreaterThanOrEqual(1.1);
  });
});

describe("Theme defaults", () => {
  it("has valid hex color values", () => {
    expect(DEFAULT_THEME.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(DEFAULT_THEME.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("has positive glass blur radius", () => {
    expect(DEFAULT_THEME.glassBlurRadius).toBeGreaterThan(0);
  });

  it("has border opacity between 0 and 1", () => {
    expect(DEFAULT_THEME.borderOpacity).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_THEME.borderOpacity).toBeLessThanOrEqual(1);
  });
});

describe("ThemeProvider", () => {
  function ThemeConsumer() {
    const { theme } = useTheme();

    return React.createElement("div", {
      "data-testid": "theme-values",
      "data-primary": theme.primaryColor,
      "data-accent": theme.accentColor,
      "data-border-opacity": theme.borderOpacity.toString(),
    });
  }

  it("merges partial globalTheme values with default theme settings", () => {
    render(
      React.createElement(ThemeProvider, { globalTheme: { primaryColor: "#000000" } }, React.createElement(ThemeConsumer))
    );

    const themeValues = screen.getByTestId("theme-values");
    expect(themeValues).toHaveAttribute("data-primary", "#000000");
    expect(themeValues).toHaveAttribute("data-accent", DEFAULT_THEME.accentColor);
    expect(themeValues).toHaveAttribute("data-border-opacity", DEFAULT_THEME.borderOpacity.toString());
  });
});
