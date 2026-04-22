import { describe, it, expect } from "vitest";
import { truncate } from "@/lib/utils";

describe("truncate", () => {
  it("returns string unchanged when within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates to exact length when over limit", () => {
    expect(truncate("hello world", 5)).toBe("hello");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles exact-length string", () => {
    expect(truncate("abc", 3)).toBe("abc");
  });
});
