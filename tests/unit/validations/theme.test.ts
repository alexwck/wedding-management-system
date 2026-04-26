import { describe, it, expect } from "vitest";
import { ThemeSchema } from "@/lib/validations/theme";

describe("ThemeSchema", () => {
  it("accepts a complete valid theme", () => {
    const result = ThemeSchema.safeParse({
      primaryColor: "#E8D5C4",
      accentColor: "#C4B5A0",
      glassBlurRadius: 16,
      borderOpacity: 0.2,
      borderRadius: "16px",
      fontFamily: "sans",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all optional)", () => {
    const result = ThemeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial themes", () => {
    const result = ThemeSchema.safeParse({ primaryColor: "#E8D5C4" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color (missing #)", () => {
    const result = ThemeSchema.safeParse({ primaryColor: "E8D5C4" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color (wrong length)", () => {
    const result = ThemeSchema.safeParse({ primaryColor: "#E8D5C" });
    expect(result.success).toBe(false);
  });

  it("rejects glassBlurRadius below 0", () => {
    const result = ThemeSchema.safeParse({ glassBlurRadius: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects glassBlurRadius above 32", () => {
    const result = ThemeSchema.safeParse({ glassBlurRadius: 33 });
    expect(result.success).toBe(false);
  });

  it("rejects borderOpacity below 0", () => {
    const result = ThemeSchema.safeParse({ borderOpacity: -0.1 });
    expect(result.success).toBe(false);
  });

  it("rejects borderOpacity above 1", () => {
    const result = ThemeSchema.safeParse({ borderOpacity: 1.1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid fontFamily", () => {
    const result = ThemeSchema.safeParse({ fontFamily: "comic" });
    expect(result.success).toBe(false);
  });

  it("accepts boundary glassBlurRadius values", () => {
    expect(ThemeSchema.safeParse({ glassBlurRadius: 0 }).success).toBe(true);
    expect(ThemeSchema.safeParse({ glassBlurRadius: 32 }).success).toBe(true);
  });

  it("accepts boundary borderOpacity values", () => {
    expect(ThemeSchema.safeParse({ borderOpacity: 0 }).success).toBe(true);
    expect(ThemeSchema.safeParse({ borderOpacity: 1 }).success).toBe(true);
  });
});
