import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloorPlanToolbar } from "@/components/floor-plan/floor-plan-toolbar";

const defaultProps = {
  canUndo: true,
  canRedo: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  zoomPercent: 100,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onFitToScreen: vi.fn(),
};

describe("FloorPlanToolbar", () => {
  it("renders all toolbar buttons", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const names = buttons.map((b) => b.textContent);
    expect(names).toContain("Undo");
    expect(names).toContain("Redo");
    expect(names).toContain("Fit");
    expect(names).toContain("+");
  });

  it("shows zoom percentage", () => {
    render(<FloorPlanToolbar {...defaultProps} zoomPercent={150} />);
    expect(screen.getByText("150%")).toBeInTheDocument();
  });

  it("renders default zoom at 100%", () => {
    render(<FloorPlanToolbar {...defaultProps} zoomPercent={100} />);
    expect(screen.getAllByText("100%").length).toBeGreaterThanOrEqual(1);
  });

  it("renders − (minus) button", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const hasMinus = buttons.some((b) => b.textContent === "−" || b.textContent === "−");
    expect(hasMinus).toBe(true);
  });

  it("renders expected button labels", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const names = buttons.map((b) => b.textContent);
    const unique = [...new Set(names)];
    // Undo, Redo, −, +, Fit
    expect(unique).toContain("Undo");
    expect(unique).toContain("Redo");
    expect(unique).toContain("+");
    expect(unique).toContain("Fit");
  });
});
