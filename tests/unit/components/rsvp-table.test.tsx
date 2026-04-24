import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RSVPTable } from "@/components/rsvp-table";

const makeRsvp = (overrides = {}) => ({
  id: 1,
  guestName: "Alice",
  status: "attending" as const,
  dietaryNotes: null,
  isVegetarian: false,
  needsBabyChair: false,
  createdAt: "2026-01-01T10:00:00Z",
  ...overrides,
});

describe("RSVPTable", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders rows for each RSVP", () => {
    render(
      <RSVPTable
        rsvps={[makeRsvp(), makeRsvp({ id: 2, guestName: "Bob" })]}
      />,
    );
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
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
    expect(screen.getAllByText("Head Table").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Seat 1").length).toBeGreaterThan(0);
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

  it("shows sort indicators on sortable columns", () => {
    render(<RSVPTable rsvps={[makeRsvp()]} />);
    const headers = screen.getAllByRole("columnheader");
    const clickable = headers.filter(h => h.classList.contains("cursor-pointer"));
    expect(clickable.length).toBeGreaterThanOrEqual(3);
  });

  it("defaults sort by submitted date descending", () => {
    render(
      <RSVPTable
        rsvps={[
          makeRsvp({ id: 1, createdAt: "2026-01-01T10:00:00Z" }),
          makeRsvp({ id: 2, guestName: "Bob", createdAt: "2026-01-03T10:00:00Z" }),
          makeRsvp({ id: 3, guestName: "Carol", createdAt: "2026-01-02T10:00:00Z" }),
        ]}
      />,
    );
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0].textContent).toContain("Bob");
    expect(rows[1].textContent).toContain("Carol");
    expect(rows[2].textContent).toContain("Alice");
  });

  it("sorts by guest name ascending when clicked", async () => {
    render(
      <RSVPTable
        rsvps={[
          makeRsvp({ id: 1, guestName: "Charlie" }),
          makeRsvp({ id: 2, guestName: "Alice" }),
          makeRsvp({ id: 3, guestName: "Bob" }),
        ]}
      />,
    );

    const guestHeaders = screen.getAllByText(/Guest/).filter(el => el.closest("th"));
    await userEvent.click(guestHeaders[0]);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0].textContent).toContain("Alice");
    expect(rows[1].textContent).toContain("Bob");
    expect(rows[2].textContent).toContain("Charlie");
  });

  it("toggles to descending on second click", async () => {
    render(
      <RSVPTable
        rsvps={[
          makeRsvp({ id: 1, guestName: "Alice" }),
          makeRsvp({ id: 2, guestName: "Bob" }),
        ]}
      />,
    );

    const guestHeaders = screen.getAllByText(/Guest/).filter(el => el.closest("th"));
    await userEvent.click(guestHeaders[0]);
    await userEvent.click(guestHeaders[0]);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0].textContent).toContain("Bob");
    expect(rows[1].textContent).toContain("Alice");
  });
});
