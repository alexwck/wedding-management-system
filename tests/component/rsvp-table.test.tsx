import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RSVPTable } from "@/components/rsvp-table";

// Helper to query within desktop table (visible on md+ screens)
function getDesktopTable() {
  return screen.getByRole("table");
}

function makeRsvps(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    guestName: `Guest ${String(i + 1).padStart(2, "0")}`,
    status: "attending" as const,
    dietaryNotes: null,
    isVegetarian: false,
    needsBabyChair: false,
    createdAt: new Date().toISOString(),
    tableName: null,
    seatLabel: null,
  }));
}

describe("RSVPTable", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders empty state when no RSVPs", () => {
    render(<RSVPTable rsvps={[]} />);
    expect(screen.getByText(/No RSVPs yet/i)).toBeInTheDocument();
  });

  it("renders all guests when under page limit", () => {
    const rsvps = makeRsvps(5);
    render(<RSVPTable rsvps={rsvps} />);

    const table = getDesktopTable();
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent("Guest 01");
    expect(table).toHaveTextContent("Guest 05");
  });

  it("paginates at 25 rows per page", () => {
    const rsvps = makeRsvps(30);
    render(<RSVPTable rsvps={rsvps} />);

    // Sort by guest name ascending for deterministic pagination
    fireEvent.click(screen.getAllByRole("columnheader")[0]);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    const table = getDesktopTable();
    expect(table).toHaveTextContent("Guest 01");
    expect(table).toHaveTextContent("Guest 25");
    // Guest 26 should not be on page 1
    expect(table).not.toHaveTextContent("Guest 26");
  });

  it("navigates to next page", () => {
    const rsvps = makeRsvps(30);
    render(<RSVPTable rsvps={rsvps} />);

    // Sort by guest name ascending for deterministic pagination
    fireEvent.click(screen.getAllByRole("columnheader")[0]);

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    const table = getDesktopTable();
    expect(table).toHaveTextContent("Guest 26");
    expect(table).toHaveTextContent("Guest 30");
    // Guest 1 should not be on page 2
    expect(table).not.toHaveTextContent("Guest 01");
  });

  it("disables previous button on first page", () => {
    const rsvps = makeRsvps(30);
    render(<RSVPTable rsvps={rsvps} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it("filters by search query", () => {
    const rsvps = [
      { id: 1, guestName: "Alice", status: "attending" as const, dietaryNotes: null, isVegetarian: false, needsBabyChair: false, createdAt: new Date().toISOString(), tableName: null, seatLabel: null },
      { id: 2, guestName: "Bob", status: "declining" as const, dietaryNotes: null, isVegetarian: false, needsBabyChair: false, createdAt: new Date().toISOString(), tableName: null, seatLabel: null },
    ];
    render(<RSVPTable rsvps={rsvps} />);

    const searchInput = screen.getByPlaceholderText(/search guests/i);
    fireEvent.change(searchInput, { target: { value: "alice" } });

    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText("Bob").length).toBe(0);
  });

  it("shows guest count summary", () => {
    const rsvps = makeRsvps(5);
    render(<RSVPTable rsvps={rsvps} />);

    expect(screen.getByText(/5 guests/i)).toBeInTheDocument();
  });

  it("renders mobile card layout with key details", () => {
    const rsvps = [
      { id: 1, guestName: "Alice", status: "attending" as const, dietaryNotes: "Vegetarian", isVegetarian: true, needsBabyChair: true, createdAt: new Date().toISOString(), tableName: "Table 1", seatLabel: "A1" },
    ];
    render(<RSVPTable rsvps={rsvps} />);

    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(2);
  });
});
