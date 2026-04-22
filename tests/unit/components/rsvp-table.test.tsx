import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RSVPTable } from "@/components/rsvp-table";

const makeRsvp = (overrides = {}) => ({
  id: 1,
  guestName: "Alice",
  status: "attending" as const,
  dietaryNotes: null,
  isVegetarian: false,
  needsBabyChair: false,
  createdAt: "2026-01-01",
  ...overrides,
});

describe("RSVPTable", () => {
  it("renders rows for each RSVP", () => {
    render(
      <RSVPTable
        rsvps={[makeRsvp(), makeRsvp({ id: 2, guestName: "Bob" })]}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty state when no RSVPs", () => {
    render(<RSVPTable rsvps={[]} />);
    expect(screen.getByText(/no rsvps/i)).toBeInTheDocument();
  });

  it("shows table and seat columns when present", () => {
    render(
      <RSVPTable
        rsvps={[makeRsvp({ tableName: "Head Table", seatLabel: "Seat 1" })]}
      />,
    );
    expect(screen.getByText("Head Table")).toBeInTheDocument();
    expect(screen.getByText("Seat 1")).toBeInTheDocument();
  });

  it("shows dash for missing seat info", () => {
    render(
      <RSVPTable
        rsvps={[makeRsvp({ tableName: null, seatLabel: null })]}
      />,
    );
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders attending status badge", () => {
    render(<RSVPTable rsvps={[makeRsvp()]} />);
    expect(screen.getAllByText("Attending").length).toBeGreaterThanOrEqual(1);
  });

  it("renders declining status badge", () => {
    render(
      <RSVPTable rsvps={[makeRsvp({ status: "declining" })]} />,
    );
    expect(screen.getAllByText("Declining").length).toBeGreaterThanOrEqual(1);
  });
});
