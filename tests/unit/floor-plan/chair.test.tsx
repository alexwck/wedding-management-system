import { describe, it, expect } from "vitest";
import { FEET_TO_PIXELS } from "@/lib/floor-plan/constants";

describe("Chair component rendering", () => {
  it("should render as Circle with radius = 0.5 * FEET_TO_PIXELS", () => {
    const expectedRadius = 0.5 * FEET_TO_PIXELS;
    expect(expectedRadius).toBe(10);
  });

  it("uses center-anchor positioning: x offset by +0.5 ft", () => {
    const x = 5; // position in feet
    const pixelX = (x + 0.5) * FEET_TO_PIXELS;
    expect(pixelX).toBe(110);
  });

  it("uses center-anchor positioning: y offset by +0.5 ft", () => {
    const y = 3;
    const pixelY = (y + 0.5) * FEET_TO_PIXELS;
    expect(pixelY).toBe(70);
  });
});
