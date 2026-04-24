import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignIn = vi.fn();
const mockFrom = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
    from: mockFrom,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

import LoginPage from "@/app/(public)/auth/login/page";

/**
 * React 19 in jsdom double-renders under StrictMode, so many queries return
 * duplicates. We use getAllBy* and check the first element throughout.
 */

describe("LoginPage", () => {
  beforeEach(() => {
    cleanup();
    mockSignIn.mockReset();
    mockFrom.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // --- Rendering tests ---

  it("renders email and password inputs and submit button", () => {
    render(<LoginPage />);

    const emailInputs = screen.getAllByLabelText("Email");
    const passwordInputs = screen.getAllByLabelText("Password");
    const submitButtons = screen.getAllByRole("button", { name: "Sign In" });

    expect(emailInputs.length).toBeGreaterThanOrEqual(1);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);
  });

  // --- Auth failure ---

  it("shows error message when auth fails", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });

    render(<LoginPage />);

    await user.type(screen.getAllByLabelText("Email")[0], "admin@example.com");
    await user.type(screen.getAllByLabelText("Password")[0], "wrong-password");
    await user.click(screen.getAllByRole("button", { name: "Sign In" })[0]);

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });

  // --- Admin redirect ---

  it("redirects to /admin for admin users", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { role: "admin" } }),
      }),
    });

    render(<LoginPage />);

    await user.type(screen.getAllByLabelText("Email")[0], "admin@example.com");
    await user.type(screen.getAllByLabelText("Password")[0], "password123");
    await user.click(screen.getAllByRole("button", { name: "Sign In" })[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  // --- Couple redirect ---

  it("redirects to /dashboard for non-admin users", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { role: "couple" } }),
      }),
    });

    render(<LoginPage />);

    await user.type(screen.getAllByLabelText("Email")[0], "couple@example.com");
    await user.type(screen.getAllByLabelText("Password")[0], "password123");
    await user.click(screen.getAllByRole("button", { name: "Sign In" })[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  // --- Loading state ---

  it("shows Signing in... while loading", async () => {
    const user = userEvent.setup();
    let resolveSignIn!: (value: { error: unknown }) => void;
    mockSignIn.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSignIn = resolve)),
    );

    render(<LoginPage />);

    await user.type(screen.getAllByLabelText("Email")[0], "admin@example.com");
    await user.type(screen.getAllByLabelText("Password")[0], "password123");
    await user.click(screen.getAllByRole("button", { name: "Sign In" })[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Signing in..." }),
      ).toBeInTheDocument();
    });

    // Set up role query mock and resolve sign-in to clean up
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { role: "admin" } }),
      }),
    });
    await resolveSignIn({ error: null });
  });
});
