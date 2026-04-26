import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BentoItem } from "@/components/bento/bento-item";

describe("BentoItem", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders children", () => {
    render(<BentoItem>Content</BentoItem>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders inside a GlassCard", () => {
    render(<BentoItem data-testid="item">Content</BentoItem>);
    const item = screen.getByTestId("item");
    expect(item.className).toContain("glass-panel");
  });

  it("applies colSpan on desktop", () => {
    render(
      <BentoItem colSpan={2} data-testid="item">
        Content
      </BentoItem>,
    );
    expect(screen.getByTestId("item").className).toContain("md:col-span-2");
  });

  it("applies rowSpan on desktop", () => {
    render(
      <BentoItem rowSpan={2} data-testid="item">
        Content
      </BentoItem>,
    );
    expect(screen.getByTestId("item").className).toContain("md:row-span-2");
  });

  it("is full width on mobile (no colSpan applied)", () => {
    render(
      <BentoItem colSpan={2} data-testid="item">
        Content
      </BentoItem>,
    );
    const className = screen.getByTestId("item").className;
    expect(className).toContain("col-span-1");
  });
});
