import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FloorPlanToolbar } from "@/components/floor-plan/floor-plan-toolbar";


vi.mock("@/components/glassmorphism/glass-button", () => ({
  GlassButton: vi.fn(({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children}</button>
  )),
}));

vi.mock("lucide-react", () => ({
  Undo2: vi.fn(() => null),
  Redo2: vi.fn(() => null),
  ZoomOut: vi.fn(() => null),
  ZoomIn: vi.fn(() => null),
  Maximize: vi.fn(() => null),
  Crosshair: vi.fn(() => null),
  HelpCircle: vi.fn(() => null),
  X: vi.fn(() => null),
}));

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
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders all toolbar buttons", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    const labels = buttons.map((b) => b.getAttribute("aria-label"));
    expect(labels).toContain("Undo");
    expect(labels).toContain("Redo");
    expect(labels).toContain("Zoom in");
    expect(labels).toContain("Zoom out");
  });

  it("shows zoom percentage", () => {
    render(<FloorPlanToolbar {...defaultProps} zoomPercent={150} />);
    expect(screen.getByText("150%")).toBeInTheDocument();
  });

  it("renders default zoom at 100%", () => {
    render(<FloorPlanToolbar {...defaultProps} zoomPercent={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders zoom out button", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const zoomOut = screen.getByRole("button", { name: /zoom out/i });
    expect(zoomOut).toBeInTheDocument();
  });

  it("renders expected button aria-labels", () => {
    render(<FloorPlanToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const labels = buttons.map((b) => b.getAttribute("aria-label")).filter(Boolean);
    expect(labels).toContain("Undo");
    expect(labels).toContain("Redo");
    expect(labels).toContain("Zoom in");
    expect(labels).toContain("Fit to screen");
  });
});
