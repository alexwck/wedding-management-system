import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/actions/rsvp", () => ({
  submitRSVP: vi.fn(),
}));

import { RSVPForm } from "@/components/rsvp-form";
import { submitRSVP } from "@/app/actions/rsvp";

const mockSubmitRSVP = vi.mocked(submitRSVP);

const defaultProps = {
  slug: "test-wedding",
  coupleName: "Alice & Bob",
};

/** shadcn FormControl wraps inputs in a div with the form-item ID,
 *  disconnecting the label from the actual input element.
 *  Use getElementById to reach the real input/select/textarea.
 *  React 19 strict-mode double-renders, so IDs may be duplicated;
 *  the first match is the one react-hook-form controls. */
function getField(id: string) {
  return document.getElementById(id) as HTMLElement;
}

describe("RSVPForm", () => {
  afterEach(cleanup);

  it("renders heading with couple name", () => {
    render(<RSVPForm {...defaultProps} />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(headings[0]).toHaveTextContent(/RSVP for Alice & Bob's Wedding/);
  });

  it("renders all form fields and labels", () => {
    render(<RSVPForm {...defaultProps} />);

    // Labels exist (React 19 may render multiple)
    expect(screen.getAllByText("Your Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dietary Notes").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Vegetarian").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Baby Chair").length).toBeGreaterThanOrEqual(1);

    // Input elements exist by id
    expect(getField("guestName")).toBeInTheDocument();
    expect(getField("status")).toBeInTheDocument();
    expect(getField("dietaryNotes")).toBeInTheDocument();
    expect(getField("isVegetarian")).toBeInTheDocument();
    expect(getField("needsBabyChair")).toBeInTheDocument();

    // Submit button
    const submitButtons = screen.getAllByRole("button", { name: "Submit RSVP" });
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("has correct default values", () => {
    render(<RSVPForm {...defaultProps} />);

    const nameInput = getField("guestName") as HTMLInputElement;
    const statusSelect = getField("status") as HTMLSelectElement;
    const vegetarianCheckbox = getField("isVegetarian") as HTMLInputElement;
    const babyChairCheckbox = getField("needsBabyChair") as HTMLInputElement;

    expect(nameInput.value).toBe("");
    expect(statusSelect.value).toBe("attending");
    expect(vegetarianCheckbox.checked).toBe(false);
    expect(babyChairCheckbox.checked).toBe(false);
  });

  it("shows error banner when server action fails", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: false,
      message: "Something went wrong",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(getField("guestName"), "Carol");
    await user.click(screen.getAllByRole("button", { name: "Submit RSVP" })[0]);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    // Form should still be visible (not replaced by thank-you)
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings[0]).toHaveTextContent(/RSVP for/);
  });

  it("shows thank you message on successful submission", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: true,
      message: "Your RSVP has been received!",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(getField("guestName"), "Carol");
    await user.click(screen.getAllByRole("button", { name: "Submit RSVP" })[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Thank You!" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Your RSVP has been received!"),
    ).toBeInTheDocument();
  });

  it("shows submitting state on button while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit!: (value: { success: boolean; message: string }) => void;
    mockSubmitRSVP.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSubmit = resolve)),
    );

    render(<RSVPForm {...defaultProps} />);

    await user.type(getField("guestName"), "Carol");
    await user.click(screen.getAllByRole("button", { name: "Submit RSVP" })[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Submitting..." }),
      ).toBeInTheDocument();
    });

    resolveSubmit({ success: true, message: "Done!" });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Thank You!" }),
      ).toBeInTheDocument();
    });
  });

  it("passes correct data to submitRSVP", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: true,
      message: "RSVP received",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(getField("guestName"), "Carol");
    await user.selectOptions(getField("status"), "declining");
    await user.type(getField("dietaryNotes"), "Nut allergy");
    await user.click(getField("isVegetarian"));
    await user.click(screen.getAllByRole("button", { name: "Submit RSVP" })[0]);

    await waitFor(() => {
      expect(mockSubmitRSVP).toHaveBeenCalledWith({
        slug: "test-wedding",
        guestName: "Carol",
        status: "declining",
        dietaryNotes: "Nut allergy",
        isVegetarian: true,
        needsBabyChair: false,
      });
    });
  });

  it("shows duplicate name error message", async () => {
    const user = userEvent.setup();
    mockSubmitRSVP.mockResolvedValueOnce({
      success: false,
      message: "A guest with this name has already submitted an RSVP.",
    });

    render(<RSVPForm {...defaultProps} />);

    await user.type(getField("guestName"), "Duplicate");
    await user.click(screen.getAllByRole("button", { name: "Submit RSVP" })[0]);

    await waitFor(() => {
      expect(screen.getByText(/already submitted an RSVP/i)).toBeInTheDocument();
    });

    // Form should still be visible
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings[0]).toHaveTextContent(/RSVP for/);
  });
});
