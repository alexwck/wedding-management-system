import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateCoupleForm } from "@/components/create-couple-form";

vi.mock("@/app/actions/admin", () => ({
  createCoupleAccount: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import { createCoupleAccount } from "@/app/actions/admin";
const mockedCreateCoupleAccount = vi.mocked(createCoupleAccount);

describe("CreateCoupleForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all form fields and submit button", () => {
    render(<CreateCoupleForm />);

    expect(screen.getByPlaceholderText(/couple@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min\. 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jane & John")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create couple/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields on submit", async () => {
    const user = userEvent.setup();
    render(<CreateCoupleForm />);

    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
    // Password and confirmPassword both show "Password must be at least 8 characters"
    expect(screen.getAllByText(/password must be at least 8 characters/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/is required/i).length).toBeGreaterThanOrEqual(2);
    expect(mockedCreateCoupleAccount).not.toHaveBeenCalled();
  });

  it("shows error message when server action fails", async () => {
    const user = userEvent.setup();
    mockedCreateCoupleAccount.mockResolvedValueOnce({
      success: false,
      error: "auth_failed" as const,
      message: "Email already registered.",
    });

    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "password123");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });

  it("shows success message with slug when server action succeeds", async () => {
    const user = userEvent.setup();
    mockedCreateCoupleAccount.mockResolvedValueOnce({
      success: true,
      userId: "user-123",
      weddingId: 1,
      slug: "jane-and-john",
    });

    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "password123");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(
      await screen.findByText(/couple account created/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/jane-and-john/)).toBeInTheDocument();
  });

  it("disables submit button and shows Creating... while submitting", async () => {
    const user = userEvent.setup();
    let resolveAction!: (value: unknown) => void;
    mockedCreateCoupleAccount.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );

    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "password123");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(screen.getByText("Creating...")).toBeInTheDocument();

    resolveAction({ success: true, userId: "u1", weddingId: 1, slug: "s" });
  });

  it("clears form fields after successful creation", async () => {
    const user = userEvent.setup();
    mockedCreateCoupleAccount.mockResolvedValueOnce({
      success: true,
      userId: "user-123",
      weddingId: 1,
      slug: "jane-and-john",
    });

    render(<CreateCoupleForm />);

    const emailInput = screen.getByPlaceholderText(/couple@example\.com/i) as HTMLInputElement;
    await user.type(emailInput, "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "password123");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    await screen.findByText(/couple account created/i);

    expect(emailInput).toHaveValue("");
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "different456");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockedCreateCoupleAccount).not.toHaveBeenCalled();
  });

  it("shows error when confirm password is empty on submit", async () => {
    const user = userEvent.setup();
    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    // intentionally skip confirm password
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockedCreateCoupleAccount).not.toHaveBeenCalled();
  });

  it("does not show mismatch error when passwords match", async () => {
    const user = userEvent.setup();
    mockedCreateCoupleAccount.mockResolvedValueOnce({
      success: true,
      userId: "user-123",
      weddingId: 1,
      slug: "test-slug",
    });

    render(<CreateCoupleForm />);

    await user.type(screen.getByPlaceholderText(/couple@example\.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/min\. 8 characters/i), "password123");
    await user.type(screen.getByPlaceholderText("Confirm Password"), "password123");
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("Jane & John"), "Jane & John");
    await user.click(screen.getByRole("button", { name: /create couple/i }));

    await screen.findByText(/couple account created/i);

    expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
  });
});
