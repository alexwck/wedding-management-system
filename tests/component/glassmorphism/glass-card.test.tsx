import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GlassCard } from "@/components/glassmorphism/glass-card";

describe("GlassCard", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders children", () => {
    render(<GlassCard>Hello</GlassCard>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies default variant class", () => {
    render(<GlassCard data-testid="card">Test</GlassCard>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("glass-panel");
  });

  it("applies heavy variant class", () => {
    render(
      <GlassCard variant="heavy" data-testid="card">
        Test
      </GlassCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("glass-panel--heavy");
  });

  it("applies light variant class", () => {
    render(
      <GlassCard variant="light" data-testid="card">
        Test
      </GlassCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("glass-panel--light");
  });

  it("renders as section when specified", () => {
    render(<GlassCard as="section" data-testid="card">Test</GlassCard>);
    expect(screen.getByTestId("card").tagName).toBe("SECTION");
  });

  it("renders as article when specified", () => {
    render(<GlassCard as="article" data-testid="card">Test</GlassCard>);
    expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
  });
});
