import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

describe("GlassPanel", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders children", () => {
    render(<GlassPanel>Hello</GlassPanel>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies glass-panel class", () => {
    render(<GlassPanel data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("glass-panel");
  });

  it("applies padding none", () => {
    render(<GlassPanel padding="none" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("p-0");
  });

  it("applies padding sm", () => {
    render(<GlassPanel padding="sm" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("p-4");
  });

  it("applies padding md", () => {
    render(<GlassPanel padding="md" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("p-6");
  });

  it("applies padding lg", () => {
    render(<GlassPanel padding="lg" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("p-8");
  });

  it("applies radius sm", () => {
    render(<GlassPanel radius="sm" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("rounded-sm");
  });

  it("applies radius glass", () => {
    render(<GlassPanel radius="glass" data-testid="panel">Test</GlassPanel>);
    expect(screen.getByTestId("panel").className).toContain("rounded-glass");
  });
});
