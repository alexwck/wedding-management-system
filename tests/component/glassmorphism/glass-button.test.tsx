import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GlassButton } from "@/components/glassmorphism/glass-button";

describe("GlassButton", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders children", () => {
    render(<GlassButton>Click</GlassButton>);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("has minimum 44x44px touch target", () => {
    render(<GlassButton>Click</GlassButton>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn.className).toContain("min-w-[44px]");
    expect(btn.className).toContain("min-h-[44px]");
  });

  it("applies primary variant", () => {
    render(<GlassButton variant="primary">Click</GlassButton>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn.className).toContain("glass-button--primary");
  });

  it("applies secondary variant", () => {
    render(<GlassButton variant="secondary">Click</GlassButton>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn.className).toContain("glass-button--secondary");
  });

  it("applies ghost variant", () => {
    render(<GlassButton variant="ghost">Click</GlassButton>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn.className).toContain("glass-button--ghost");
  });

  it("applies size sm", () => {
    render(<GlassButton size="sm">Click</GlassButton>);
    expect(screen.getByRole("button").className).toContain("text-sm");
  });

  it("applies size lg", () => {
    render(<GlassButton size="lg">Click</GlassButton>);
    expect(screen.getByRole("button").className).toContain("text-lg");
  });
});
