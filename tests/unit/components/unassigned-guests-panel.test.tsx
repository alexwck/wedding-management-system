import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnassignedGuestsPanel } from "@/components/floor-plan/unassigned-guests-panel";

describe("UnassignedGuestsPanel", () => {
  it("renders guest list", () => {
    render(
      <UnassignedGuestsPanel
        guests={[
          { id: 1, guestName: "Alice" },
          { id: 2, guestName: "Bob" },
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty state when all guests seated", () => {
    render(<UnassignedGuestsPanel guests={[]} isLoading={false} />);
    expect(screen.getByText(/all guests are seated/i)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<UnassignedGuestsPanel guests={[]} isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders guest names", () => {
    render(
      <UnassignedGuestsPanel
        guests={[
          { id: 1, guestName: "Carol" },
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });
});
