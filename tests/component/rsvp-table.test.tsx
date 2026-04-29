import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RSVPTable } from "@/components/rsvp-table";

function makeRsvps(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    guestName: `Guest ${i + 1}`,
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

    expect(screen.getAllByText("Guest 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Guest 5").length).toBeGreaterThanOrEqual(1);
  });

  it("paginates at 25 rows per page", () => {
    const rsvps = makeRsvps(30);
    render(<RSVPTable rsvps={rsvps} />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getAllByText("Guest 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Guest 25").length).toBeGreaterThanOrEqual(1);
    // Guest 26 should not be on page 1
    expect(screen.queryAllByText("Guest 26").length).toBe(0);
  });

  it("navigates to next page", () => {
    const rsvps = makeRsvps(30);
    render(<RSVPTable rsvps={rsvps} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getAllByText("Guest 26").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Guest 30").length).toBeGreaterThanOrEqual(1);
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
