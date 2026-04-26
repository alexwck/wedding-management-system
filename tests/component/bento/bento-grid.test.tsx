import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BentoGrid } from "@/components/bento/bento-grid";

describe("BentoGrid", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders children", () => {
    render(
      <BentoGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </BentoGrid>,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies grid class", () => {
    render(<BentoGrid data-testid="grid">Test</BentoGrid>);
    expect(screen.getByTestId("grid").className).toContain("grid");
  });

  it("applies mobile single column", () => {
    render(<BentoGrid data-testid="grid">Test</BentoGrid>);
    expect(screen.getByTestId("grid").className).toContain("grid-cols-1");
  });

  it("applies desktop columns when specified", () => {
    render(
      <BentoGrid cols={3} data-testid="grid">
        Test
      </BentoGrid>,
    );
    const grid = screen.getByTestId("grid");
    expect(grid.className).toContain("md:grid-cols-3");
  });

  it("applies gap sm", () => {
    render(
      <BentoGrid gap="sm" data-testid="grid">
        Test
      </BentoGrid>,
    );
    expect(screen.getByTestId("grid").className).toContain("gap-2");
  });

  it("applies gap md", () => {
    render(
      <BentoGrid gap="md" data-testid="grid">
        Test
      </BentoGrid>,
    );
    expect(screen.getByTestId("grid").className).toContain("gap-4");
  });

  it("applies gap lg", () => {
    render(
      <BentoGrid gap="lg" data-testid="grid">
        Test
      </BentoGrid>,
    );
    expect(screen.getByTestId("grid").className).toContain("gap-6");
  });
});
