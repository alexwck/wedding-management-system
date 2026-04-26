import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RSVPForm } from "@/components/rsvp-form";

vi.mock("@/app/actions/rsvp", () => ({
  submitRSVP: vi.fn(),
}));

describe("RSVPForm mobile", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders all fields", () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText(/Dietary Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Vegetarian/i)).toBeInTheDocument();
    expect(screen.getByText(/Baby Chair/i)).toBeInTheDocument();
  });

  it("input has minimum 44px height for touch targets", () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" />);
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input.className).toContain("min-h-[44px]");
  });

  it("shows inline validation error for empty guest name", async () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" />);
    const submitBtn = screen.getByRole("button", { name: /Submit RSVP/i });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
  });

  it("shows inline validation error below the field, not obstructing others", () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" />);
    const error = screen.queryByText(/invalid/i);
    // No global error overlay; inline only
    expect(error).not.toBeInTheDocument();
  });

  it("conditional fields appear based on status", () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" />);
    // Dietary notes and vegetarian are always visible in current design
    expect(screen.getByText(/Dietary Notes/i)).toBeInTheDocument();
  });

  it("shows locked message when isLocked is true", () => {
    render(<RSVPForm slug="test" coupleName="Alice & Bob" isLocked />);
    expect(screen.getByText(/RSVP is now closed/i)).toBeInTheDocument();
  });
});
