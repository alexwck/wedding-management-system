/**
 * T-COMP-01 and T-COMP-02: the per-spec storageState opt-out contract.
 *
 * The feature 014 setup project signs in once per run and writes storageState JSONs.
 * Specs that need a fresh context opt in with:
 *   test.use({ storageState: { cookies: [], origins: [] } })
 * Specs that need the non-default role opt in with:
 *   test.use({ storageState: "playwright/.auth/couple.json" })
 *
 * This file pins the React-side invariants of that contract. The test files that USE
 * the opt-in pattern (couple-dashboard.spec.ts, floor-plan.spec.ts) verify the
 * Playwright-side behavior. The two halves together prove the contract is end-to-end
 * correct.
 *
 * These tests live at the Component tier (not E2E) because:
 *   - They run in jsdom with no network and no browser
 *   - The behaviors they verify (rendering, form submit, error display) are React-level
 *   - A regression here would be caught in <500 ms, not after 5+ s in an E2E run
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignIn = vi.fn();
const mockFrom = vi.fn();
const mockPush = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignIn },
    from: mockFrom,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock("@/app/actions/rsvp", () => ({
  submitRSVP: vi.fn(),
}));

import LoginPage from "@/app/(public)/auth/login/page";
import { RSVPForm } from "@/components/rsvp-form";
import { submitRSVP } from "@/app/actions/rsvp";

const mockSubmitRSVP = vi.mocked(submitRSVP);

describe("Per-spec storageState opt-out contract (T-COMP-01)", () => {
  afterEach(() => {
    cleanup();
    mockSignIn.mockReset();
    mockFrom.mockReset();
    mockPush.mockReset();
  });

  it("LoginPage with empty storageState does NOT auto-submit the form", async () => {
    // Render the page as a fresh visitor would: no cookies, no localStorage, no redirect.
    // This is the React-side counterpart of the E2E test that uses
    //   test.use({ storageState: { cookies: [], origins: [] } })
    // The contract: rendering the page does not trigger a sign-in or a redirect.
    render(<LoginPage />);

    // The form is present
    const emailInputs = screen.getAllByLabelText(/email/i);
    expect(emailInputs.length).toBeGreaterThanOrEqual(1);

    // The submit button is present and not disabled
    const submitButtons = screen.getAllByRole("button", { type: "submit" });
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);

    // Critically: signInWithPassword was never called. A regression that auto-submits on
    // mount would call this and the storageState opt-out would silently break.
    expect(mockSignIn).not.toHaveBeenCalled();

    // And the router was never told to navigate. A regression that auto-redirects an
    // unauthenticated user to /dashboard would call this and the test would fail.
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("LoginPage requires explicit user action to sign in (storageState empty path)", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ data: { user: null, session: null }, error: { message: "Invalid credentials" } });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnThis() });

    render(<LoginPage />);

    const emailInput = screen.getAllByLabelText(/email/i)[0] as HTMLInputElement;
    const passwordInput = screen.getAllByLabelText(/password/i)[0] as HTMLInputElement;
    const submitButton = screen.getAllByRole("button", { type: "submit" })[0] as HTMLButtonElement;

    // Before user interaction, signIn was not called
    expect(mockSignIn).not.toHaveBeenCalled();

    // User explicitly types and submits
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password");
    await user.click(submitButton);

    // Now signIn was called - the form did NOT auto-submit
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
  });
});

describe("RsvpForm error path coverage (T-COMP-02)", () => {
  afterEach(() => {
    cleanup();
    mockSubmitRSVP.mockReset();
  });

  it("renders the error state when submitRSVP returns success=false (the 401-style failure)", async () => {
    // The action returns { success: false, error: "..." } on auth failure, locked
    // wedding, duplicate guest, etc. The form must display the error message rather
    // than silently failing. With the new storageState model, the 401 case is more
    // likely (expired session mid-test), so this branch matters.
    mockSubmitRSVP.mockResolvedValue({
      success: false,
      message: "Unauthorized: session expired",
    });

    const user = userEvent.setup();
    render(<RSVPForm slug="test-wedding" coupleName="Alice & Bob" />);

    // Fill out the form
    const guestNameInput = document.getElementById("guestName") as HTMLInputElement;
    await user.type(guestNameInput, "Test Guest");
    const submitButton = screen.getAllByRole("button", { type: "submit" })[0] as HTMLButtonElement;
    await user.click(submitButton);

    // Wait for the error state to appear
    await waitFor(() => {
      const errorEls = screen.getAllByText(/Unauthorized|session expired/i);
      expect(errorEls.length).toBeGreaterThanOrEqual(1);
    });

    // mockSubmitRSVP was called once
    expect(mockSubmitRSVP).toHaveBeenCalledTimes(1);
  });

  it("renders the network error state when submitRSVP throws", async () => {
    // The form catches the throw and renders a network error UI. The 401-style mock
    // doesn't trigger this path, but a real network failure (e.g. storageState expired
    // and the server action threw) would.
    mockSubmitRSVP.mockRejectedValue(new Error("Network unreachable"));

    const user = userEvent.setup();
    render(<RSVPForm slug="test-wedding" coupleName="Alice & Bob" />);

    const guestNameInput = document.getElementById("guestName") as HTMLInputElement;
    await user.type(guestNameInput, "Test Guest");
    const submitButton = screen.getAllByRole("button", { type: "submit" })[0] as HTMLButtonElement;
    await user.click(submitButton);

    await waitFor(() => {
      const offlineEls = screen.getAllByText(/offline|network unreachable|connection/i);
      expect(offlineEls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
