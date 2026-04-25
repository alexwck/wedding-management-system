import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CanvasStats } from "@/components/floor-plan/canvas-stats";
import type { FloorPlanItem } from "@/types/floor-plan";

function makeItem(
  type: FloorPlanItem["type"],
  id: string,
  parentItemId: string | null = null,
  chairCount?: number,
): FloorPlanItem {
  return {
    id,
    type,
    label: type === "round_table" ? "Table 1" : type === "long_table" ? "Table 2" : "Chair",
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    rotation: 0,
    parentItemId,
    metadata: chairCount !== undefined ? { chairCount } : {},
  };
}

describe("CanvasStats", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows zero counts for empty canvas", () => {
    render(<CanvasStats items={[]} assignmentMap={{}} />);
    expect(screen.getByText(/0 Round/)).toBeInTheDocument();
    expect(screen.getByText(/0 Long/)).toBeInTheDocument();
    expect(screen.getByText(/0 chairs/)).toBeInTheDocument();
  });

  it("shows mixed table counts", () => {
    const items = [
      makeItem("round_table", "t1"),
      makeItem("round_table", "t2"),
      makeItem("long_table", "t3"),
      makeItem("chair", "c1", "t1"),
      makeItem("chair", "c2", "t2"),
      makeItem("chair", "c3", "t3"),
    ];

    render(<CanvasStats items={items} assignmentMap={{}} />);

    expect(screen.getByText(/2 Round/)).toBeInTheDocument();
    expect(screen.getByText(/1 Long/)).toBeInTheDocument();
    expect(screen.getByText(/3 chairs/)).toBeInTheDocument();
  });

  it("shows assigned and empty chair counts", () => {
    const items = [
      makeItem("round_table", "t1"),
      makeItem("chair", "c1", "t1"),
      makeItem("chair", "c2", "t1"),
    ];

    const assignmentMap = {
      "c1": { guestName: "Alice", rsvpId: 1 },
    };

    render(<CanvasStats items={items} assignmentMap={assignmentMap} />);

    expect(screen.getByText(/1 assigned/)).toBeInTheDocument();
    expect(screen.getByText(/1 empty/)).toBeInTheDocument();
  });

  it("shows all assigned with surplus chairs", () => {
    const items = [
      makeItem("round_table", "t1"),
      makeItem("chair", "c1", "t1"),
      makeItem("chair", "c2", "t1"),
      makeItem("chair", "c3", "t1"),
    ];

    const assignmentMap = {
      "c1": { guestName: "Alice", rsvpId: 1 },
      "c2": { guestName: "Bob", rsvpId: 2 },
    };

    render(<CanvasStats items={items} assignmentMap={assignmentMap} />);

    expect(screen.getByText(/2 assigned/)).toBeInTheDocument();
    expect(screen.getByText(/1 empty/)).toBeInTheDocument();
  });

  it("ignores non-chair items in chair count", () => {
    const items = [
      makeItem("round_table", "t1"),
      makeItem("stage", "s1"),
      makeItem("chair", "c1", "t1"),
    ];

    render(<CanvasStats items={items} assignmentMap={{}} />);

    expect(screen.getByText(/1 chair/)).toBeInTheDocument();
  });
});
