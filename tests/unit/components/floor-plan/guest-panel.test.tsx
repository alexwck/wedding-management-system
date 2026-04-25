import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuestPanel } from "@/components/floor-plan/guest-panel";
import type { UnassignedGuest } from "@/types/seat-assignment";
import type { FloorPlanItem } from "@/types/floor-plan";

vi.mock("@/app/actions/admin", () => ({
  updateTemplateFocalPoint: vi.fn().mockResolvedValue({ success: true }),
}));

const makeItem = (
  type: FloorPlanItem["type"],
  id: string,
  parentItemId: string | null = null,
): FloorPlanItem => ({
  id,
  type,
  label: type === "round_table" ? "Table 1" : type === "long_table" ? "Table 2" : "Chair",
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  rotation: 0,
  parentItemId,
  metadata: {},
});

describe("GuestPanel", () => {
  const unassignedGuests: UnassignedGuest[] = [
    { id: 1, guestName: "Alice" },
    { id: 2, guestName: "Bob" },
  ];

  const assignmentMap = {
    "chair-1": { guestName: "Carol", rsvpId: 3 },
  };

  const items: FloorPlanItem[] = [
    makeItem("round_table", "table-1"),
    makeItem("chair", "chair-1", "table-1"),
    makeItem("chair", "chair-2", "table-1"),
  ];

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows unassigned section expanded by default", () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Unassigned (2)")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeVisible();
  });

  it("shows assigned section collapsed by default", () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Assigned (1)")).toBeInTheDocument();
    expect(screen.queryByText("Carol")).not.toBeInTheDocument();
  });

  it("toggles assigned section on click", async () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    const assignedHeader = screen.getByText("Assigned (1)");
    await userEvent.click(assignedHeader);

    expect(screen.getByText(/Carol.*Table 1/)).toBeVisible();
  });

  it("toggles unassigned section on click", async () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    const unassignedHeader = screen.getByText("Unassigned (2)");
    await userEvent.click(unassignedHeader);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <GuestPanel
        unassignedGuests={[]}
        assignmentMap={{}}
        items={[]}
        isLoading={true}
      />,
    );

    expect(screen.getByText("Loading guests...")).toBeInTheDocument();
  });

  it("shows empty state for zero guests", () => {
    render(
      <GuestPanel
        unassignedGuests={[]}
        assignmentMap={{}}
        items={[]}
        isLoading={false}
      />,
    );

    expect(screen.getByText("No guests yet")).toBeInTheDocument();
  });

  it("shows table number for assigned guests", async () => {
    render(
      <GuestPanel
        unassignedGuests={[]}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    await userEvent.click(screen.getByText("Assigned (1)"));
    expect(screen.getByText(/Carol.*Table 1/)).toBeVisible();
  });

  it("shows all guests seated message when unassigned is empty but assigned exists", async () => {
    render(
      <GuestPanel
        unassignedGuests={[]}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    expect(screen.getByText("All guests are seated!")).toBeInTheDocument();
  });

  it("supports keyboard toggle with Enter", async () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    const assignedButton = screen.getByRole("button", { name: /^assigned guests/i });
    fireEvent.click(assignedButton);

    expect(screen.getByText(/Carol.*Table 1/)).toBeVisible();
  });

  it("supports keyboard toggle with Space", async () => {
    render(
      <GuestPanel
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        items={items}
        isLoading={false}
      />,
    );

    const assignedButton = screen.getByRole("button", { name: /^assigned guests/i });
    fireEvent.click(assignedButton);

    expect(screen.getByText(/Carol.*Table 1/)).toBeVisible();
  });
});
