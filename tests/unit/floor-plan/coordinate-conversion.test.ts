import { describe, it, expect } from "vitest";
import { FEET_TO_PIXELS } from "@/lib/floor-plan/constants";

// T002: Unit tests for center-to-top-left coordinate conversion
// These test the math that will be used in rendering and drag handlers.

// --- Round table conversion ---
// Rendering: centerX = (x + width/2) * FEET_TO_PIXELS
// Drag back:  x = node.x() / FEET_TO_PIXELS - width/2

describe("Round table coordinate conversion", () => {
  it("computes center from top-left for rendering", () => {
    // A 5ft round table at position (10, 10) feet (top-left of bounding box)
    const x = 10;
    const y = 10;
    const diameter = 5;
    const width = diameter;
    const height = diameter;

    const centerX = (x + width / 2) * FEET_TO_PIXELS;
    const centerY = (y + height / 2) * FEET_TO_PIXELS;

    // Center should be at (12.5 * 20, 12.5 * 20) = (250, 250)
    expect(centerX).toBe(250);
    expect(centerY).toBe(250);
  });

  it("recovers top-left from center after drag", () => {
    // After drag, node.x() returns center in pixels (for Circle)
    const nodeX = 300; // pixels — new center position
    const nodeY = 400;
    const width = 5;
    const height = 5;

    const newX = nodeX / FEET_TO_PIXELS - width / 2;
    const newY = nodeY / FEET_TO_PIXELS - height / 2;

    // 300/20 - 2.5 = 15 - 2.5 = 12.5 (top-left x in feet)
    expect(newX).toBe(12.5);
    expect(newY).toBeCloseTo(17.5);
  });

  it("round-trips: top-left → center → top-left", () => {
    const originalX = 8.3;
    const originalY = 15.7;
    const width = 5;

    // Render: top-left to center pixels
    const centerPx = (originalX + width / 2) * FEET_TO_PIXELS;
    const centerPy = (originalY + width / 2) * FEET_TO_PIXELS;

    // Drag back: center pixels to top-left feet
    const recoveredX = centerPx / FEET_TO_PIXELS - width / 2;
    const recoveredY = centerPy / FEET_TO_PIXELS - width / 2;

    expect(recoveredX).toBeCloseTo(originalX);
    expect(recoveredY).toBeCloseTo(originalY);
  });

  it("handles edge case: table at origin (0,0)", () => {
    const x = 0;
    const width = 5;

    const centerX = (x + width / 2) * FEET_TO_PIXELS;
    const recoveredX = centerX / FEET_TO_PIXELS - width / 2;

    expect(centerX).toBe(50); // 2.5 * 20
    expect(recoveredX).toBeCloseTo(0);
  });
});

// --- Long table conversion ---
// Rendering: x = (item.x + width/2) * FEET_TO_PIXELS, offsetX = pixelWidth/2
// Drag back: x = node.x() / FEET_TO_PIXELS - width/2

describe("Long table coordinate conversion", () => {
  it("computes center from top-left for rendering", () => {
    const x = 10;
    const y = 15;
    const width = 6;
    const height = 2.5;

    const centerX = (x + width / 2) * FEET_TO_PIXELS;
    const centerY = (y + height / 2) * FEET_TO_PIXELS;
    const offsetX = (width * FEET_TO_PIXELS) / 2;
    const offsetY = (height * FEET_TO_PIXELS) / 2;

    // Center: (13 * 20, 16.25 * 20) = (260, 325)
    expect(centerX).toBe(260);
    expect(centerY).toBe(325);
    // Offset: (120/2, 50/2) = (60, 25)
    expect(offsetX).toBe(60);
    expect(offsetY).toBe(25);
  });

  it("recovers top-left from center+offset after drag", () => {
    // After drag with offset, node.x() returns position (which is center since offset shifts visual)
    const nodeX = 300;
    const nodeY = 400;
    const width = 6;
    const height = 2.5;

    const newX = nodeX / FEET_TO_PIXELS - width / 2;
    const newY = nodeY / FEET_TO_PIXELS - height / 2;

    // 300/20 - 3 = 15 - 3 = 12
    // 400/20 - 1.25 = 20 - 1.25 = 18.75
    expect(newX).toBe(12);
    expect(newY).toBe(18.75);
  });

  it("round-trips: top-left → center+offset → top-left", () => {
    const originalX = 8.3;
    const originalY = 15.7;
    const width = 6;
    const height = 2.5;

    const centerPx = (originalX + width / 2) * FEET_TO_PIXELS;
    const centerPy = (originalY + height / 2) * FEET_TO_PIXELS;

    const recoveredX = centerPx / FEET_TO_PIXELS - width / 2;
    const recoveredY = centerPy / FEET_TO_PIXELS - height / 2;

    expect(recoveredX).toBeCloseTo(originalX);
    expect(recoveredY).toBeCloseTo(originalY);
  });
});

// --- Edge case: NaN/Infinity protection ---

describe("Edge case: boundary coordinate values", () => {
  it("does not produce NaN when table is at canvas edge", () => {
    const x = 49.5; // near edge of 50ft canvas
    const width = 5;

    const centerX = (x + width / 2) * FEET_TO_PIXELS;
    const recoveredX = centerX / FEET_TO_PIXELS - width / 2;

    expect(Number.isNaN(centerX)).toBe(false);
    expect(Number.isFinite(centerX)).toBe(true);
    expect(Number.isNaN(recoveredX)).toBe(false);
    expect(Number.isFinite(recoveredX)).toBe(true);
  });

  it("does not produce NaN when table is rotated then dragged", () => {
    // Simulate: table at (10, 10), rotated 45 degrees, then dragged to new center
    const originalX = 10;
    const originalY = 10;
    const width = 5;

    // After rotation and drag, node reports new center position
    const newCenterPx = (originalX + width / 2) * FEET_TO_PIXELS + 100;
    const newCenterPy = (originalY + width / 2) * FEET_TO_PIXELS + 100;

    const newX = newCenterPx / FEET_TO_PIXELS - width / 2;
    const newY = newCenterPy / FEET_TO_PIXELS - width / 2;

    expect(Number.isNaN(newX)).toBe(false);
    expect(Number.isNaN(newY)).toBe(false);
    expect(Number.isFinite(newX)).toBe(true);
    expect(Number.isFinite(newY)).toBe(true);
  });

  it("handles zero-width item gracefully", () => {
    const x = 10;
    const width = 0;

    const centerX = (x + width / 2) * FEET_TO_PIXELS;
    const recoveredX = centerX / FEET_TO_PIXELS - width / 2;

    expect(Number.isNaN(centerX)).toBe(false);
    expect(recoveredX).toBeCloseTo(x);
  });
});
