import { describe, it, expect } from "vitest";
import { ROTATION_SNAPS, paddedRectHitFunc, paddedCircleHitFunc } from "@/lib/floor-plan/constants";

describe("ROTATION_SNAPS", () => {
  it("contains 24 values from 0 to 345 in 15° increments", () => {
    expect(ROTATION_SNAPS).toHaveLength(24);
    expect(ROTATION_SNAPS[0]).toBe(0);
    expect(ROTATION_SNAPS[ROTATION_SNAPS.length - 1]).toBe(345);
    for (let i = 1; i < ROTATION_SNAPS.length; i++) {
      expect(ROTATION_SNAPS[i] - ROTATION_SNAPS[i - 1]).toBe(15);
    }
  });
});

describe("rotation snap logic", () => {
  const SNAP_TOLERANCE = 5;

  function snapRotation(angle: number): number {
    for (const snap of ROTATION_SNAPS) {
      if (Math.abs(angle - snap) <= SNAP_TOLERANCE) return snap;
    }
    return angle;
  }

  it("snaps to 0° when within tolerance", () => {
    expect(snapRotation(3)).toBe(0);
    expect(snapRotation(-3)).toBe(0);
    expect(snapRotation(5)).toBe(0);
  });

  it("snaps to 90° when within tolerance", () => {
    expect(snapRotation(87)).toBe(90);
    expect(snapRotation(93)).toBe(90);
    expect(snapRotation(95)).toBe(90);
  });

  it("snaps to 180° when within tolerance", () => {
    expect(snapRotation(177)).toBe(180);
    expect(snapRotation(183)).toBe(180);
  });

  it("snaps to 270° when within tolerance", () => {
    expect(snapRotation(268)).toBe(270);
    expect(snapRotation(272)).toBe(270);
  });

  it("does not snap when outside tolerance", () => {
    expect(snapRotation(22)).toBe(22);
    expect(snapRotation(38)).toBe(38);
    expect(snapRotation(53)).toBe(53);
  });

  it("snaps near 345° boundary", () => {
    expect(snapRotation(342)).toBe(345);
    expect(snapRotation(348)).toBe(345);
  });
});

describe("paddedRectHitFunc", () => {
  it("is a function", () => {
    expect(typeof paddedRectHitFunc).toBe("function");
  });
});

describe("paddedCircleHitFunc", () => {
  it("is a function", () => {
    expect(typeof paddedCircleHitFunc).toBe("function");
  });
});
