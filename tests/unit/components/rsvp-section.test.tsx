import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RSVPSection } from "@/components/rsvp-section";

const mockRsvps = [
  {
    id: 1,
    guestName: "Alice",
    status: "attending" as const,
    dietaryNotes: null,
    isVegetarian: false,
    needsBabyChair: false,
    createdAt: "2026-01-01T10:00:00Z",
  },
  {
    id: 2,
    guestName: "Bob",
    status: "declining" as const,
    dietaryNotes: "Nut allergy",
    isVegetarian: true,
    needsBabyChair: false,
    createdAt: "2026-01-02T10:00:00Z",
  },
];

describe("RSVPSection", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with count in header", () => {
    render(<RSVPSection rsvps={mockRsvps} />);
    expect(screen.getAllByText(/RSVP Responses \(2\)/).length).toBeGreaterThan(0);
  });

  it("shows guest names when expanded", () => {
    render(<RSVPSection rsvps={mockRsvps} />);
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
  });

  it("collapses on toggle click", async () => {
    render(<RSVPSection rsvps={mockRsvps} />);

    const headers = screen.getAllByText(/RSVP Responses/);
    await userEvent.click(headers[0]);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("expands again after second click", async () => {
    render(<RSVPSection rsvps={mockRsvps} />);

    const headers = screen.getAllByText(/RSVP Responses/);
    await userEvent.click(headers[0]);
    await userEvent.click(headers[0]);

    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });

  it("shows empty state when zero RSVPs", () => {
    render(<RSVPSection rsvps={[]} />);
    expect(screen.getAllByText("No RSVP responses yet").length).toBeGreaterThan(0);
  });

  it("uses custom title when provided", () => {
    render(<RSVPSection rsvps={mockRsvps} title="All Responses" />);
    expect(screen.getAllByText(/All Responses \(2\)/).length).toBeGreaterThan(0);
  });
});
