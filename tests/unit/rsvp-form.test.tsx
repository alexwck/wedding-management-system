import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RSVPForm } from "@/components/rsvp-form";

// Mock the server action
vi.mock("@/app/actions/rsvp", () => ({
  submitRSVP: vi.fn(),
}));

import { submitRSVP } from "@/app/actions/rsvp";
const mockSubmitRSVP = vi.mocked(submitRSVP);

describe("RSVPForm", () => {
  const defaultProps = {
    slug: "test-wedding-1",
    coupleName: "Alex & Sam",
  };

  afterEach(() => {
    cleanup();
  });

  it("renders all form fields", () => {
    render(<RSVPForm {...defaultProps} />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dietary notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vegetarian/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/baby chair/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit rsvp/i })).toBeInTheDocument();
  });

  it("shows couple name in heading", () => {
    render(<RSVPForm {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Alex & Sam/i);
  });

  it("shows validation error when submitting without name", async () => {
    const user = userEvent.setup();
    render(<RSVPForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("calls submitRSVP with form data on valid submission", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: true,
      message: "Your RSVP has been submitted. Thank you!",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/your name/i), "Jane Doe");
    await user.selectOptions(screen.getByLabelText(/status/i), "attending");
    await user.type(screen.getByLabelText(/dietary notes/i), "No nuts");
    await user.click(screen.getByLabelText(/vegetarian/i));
    await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

    await waitFor(() => {
      expect(mockSubmitRSVP).toHaveBeenCalledWith({
        slug: "test-wedding-1",
        guestName: "Jane Doe",
        status: "attending",
        dietaryNotes: "No nuts",
        isVegetarian: true,
        needsBabyChair: false,
      });
    });
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: true,
      message: "Your RSVP has been submitted. Thank you!",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/your name/i), "Jane Doe");
    await user.selectOptions(screen.getByLabelText(/status/i), "attending");
    await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /thank you/i })).toBeInTheDocument();
    });
  });

  it("shows duplicate error message", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: false,
      error: "duplicate_name",
      message: "A guest with this name has already submitted an RSVP.",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/your name/i), "Duplicate");
    await user.selectOptions(screen.getByLabelText(/status/i), "attending");
    await user.click(screen.getByRole("button", { name: /submit rsvp/i }));

    await waitFor(() => {
      expect(screen.getByText(/already submitted an RSVP/i)).toBeInTheDocument();
    });
  });
});
