import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ErrorBoundary from "@/app/error";

describe("ErrorBoundary", () => {
  const mockReset = vi.fn();
  const testError = new Error("Test error message");

  beforeEach(() => {
    cleanup();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders error heading and message", () => {
    render(<ErrorBoundary error={testError} reset={mockReset} />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings[0]).toHaveTextContent("Something went wrong");

    const messages = screen.getAllByText(
      "An unexpected error occurred. Please try again.",
    );
    expect(messages[0]).toBeInTheDocument();
  });

  it('renders "Try Again" button that calls reset', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundary error={testError} reset={mockReset} />);

    const buttons = screen.getAllByRole("button", { name: /try again/i });
    await user.click(buttons[0]);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("logs error to console via useEffect", () => {
    const errorWithDigest = Object.assign(
      new Error("digest error"),
      { digest: "abc123" },
    );

    render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith(errorWithDigest);
  });
});
