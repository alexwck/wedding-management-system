import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup, act } from "@testing-library/react";

import { VenueEditor } from "@/components/venue-editor";
import type { GeocodingResponse } from "@/lib/geocoding";

vi.mock("@/app/actions/admin", () => ({
  updateWeddingDetails: vi.fn(),
}));

vi.mock("@/lib/geocoding", () => ({
  searchAddress: vi.fn(),
}));

import { updateWeddingDetails } from "@/app/actions/admin";
import { searchAddress } from "@/lib/geocoding";

const mockUpdateWeddingDetails = vi.mocked(updateWeddingDetails);
const mockSearchAddress = vi.mocked(searchAddress);

/**
 * React 19 in jsdom double-renders under StrictMode, so many queries return
 * duplicates. We use getAllBy* and check the first element throughout.
 */

describe("VenueEditor", () => {
  beforeEach(() => {
    cleanup();
    mockSearchAddress.mockReset();
    mockUpdateWeddingDetails.mockReset();
    mockSearchAddress.mockResolvedValue({ ok: true, results: [] });
    mockUpdateWeddingDetails.mockResolvedValue({ success: true, wedding: { slug: "test-wedding" } });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // --- Rendering tests (real timers) ---

  it("renders form with initial values", () => {
    render(
      <VenueEditor
        weddingId={1}
        initialVenue="The Grand Ballroom"
        initialAddress="123 Main St"
        initialLat={40.7128}
        initialLng={-74.006}
        initialWelcomeMessage="Welcome to our wedding!"
      />,
    );

    const venueInputs = screen.getAllByLabelText("Venue Name");
    const addressInputs = screen.getAllByLabelText("Address");
    const messageInputs = screen.getAllByLabelText("Welcome Message");

    expect(venueInputs[0]).toHaveValue("The Grand Ballroom");
    expect(addressInputs[0]).toHaveValue("123 Main St");
    expect(messageInputs[0]).toHaveValue("Welcome to our wedding!");
  });

  it("renders empty form when no initial values provided", () => {
    render(<VenueEditor weddingId={1} />);

    const venueInputs = screen.getAllByLabelText("Venue Name");
    const addressInputs = screen.getAllByLabelText("Address");
    const messageInputs = screen.getAllByLabelText("Welcome Message");

    expect(venueInputs[0]).toHaveValue("");
    expect(addressInputs[0]).toHaveValue("");
    expect(messageInputs[0]).toHaveValue("");
  });

  it("renders venue name input, address input, and welcome message textarea", () => {
    render(<VenueEditor weddingId={1} />);

    expect(screen.getAllByLabelText("Venue Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Address").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Welcome Message").length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Save Venue Details" button', () => {
    render(<VenueEditor weddingId={1} />);

    const buttons = screen.getAllByRole("button", { name: "Save Venue Details" });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  // --- Geocoding / debounce tests (fake timers) ---
  // Using fireEvent instead of userEvent because vi.useFakeTimers() interferes
  // with userEvent's internal event loop. Each test manages its own fake timer
  // lifecycle and restores real timers before using waitFor.

  it("calls searchAddress after debounce when typing in address field", async () => {
    vi.useFakeTimers();
    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.change(addressInput, { target: { value: "123 Main" } });
    });

    expect(mockSearchAddress).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mockSearchAddress).toHaveBeenCalledWith("123 Main");
    vi.useRealTimers();
  });

  it("does not call searchAddress for queries shorter than 3 characters", async () => {
    vi.useFakeTimers();
    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.change(addressInput, { target: { value: "ab" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mockSearchAddress).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('shows "No results found." when searchAddress returns empty results', async () => {
    vi.useFakeTimers();
    mockSearchAddress.mockResolvedValue({ ok: true, results: [] } as GeocodingResponse);

    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.change(addressInput, { target: { value: "xyz" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Restore real timers before waitFor
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  it('shows "Unable to search for addresses." when searchAddress returns api_error', async () => {
    vi.useFakeTimers();
    mockSearchAddress.mockResolvedValue({ ok: false, error: "api_error" } as GeocodingResponse);

    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.change(addressInput, { target: { value: "fail" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText("Unable to search for addresses.")).toBeInTheDocument();
    });
  });

  it("shows suggestion dropdown when searchAddress returns results", async () => {
    vi.useFakeTimers();
    const results = [
      { display_name: "123 Main St, Springfield, IL", lat: "39.7817", lon: "-89.6501" },
      { display_name: "456 Oak Ave, Shelbyville, IL", lat: "39.4028", lon: "-89.2009" },
    ];
    mockSearchAddress.mockResolvedValue({ ok: true, results } as GeocodingResponse);

    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.focus(addressInput);
      fireEvent.change(addressInput, { target: { value: "Main St" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText("123 Main St, Springfield, IL")).toBeInTheDocument();
      expect(screen.getByText("456 Oak Ave, Shelbyville, IL")).toBeInTheDocument();
    });
  });

  it("populates address and coordinates when clicking a suggestion", async () => {
    vi.useFakeTimers();
    const results = [
      { display_name: "123 Main St, Springfield, IL", lat: "39.7817", lon: "-89.6501" },
    ];
    mockSearchAddress.mockResolvedValue({ ok: true, results } as GeocodingResponse);

    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.focus(addressInput);
      fireEvent.change(addressInput, { target: { value: "Main St" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText("123 Main St, Springfield, IL")).toBeInTheDocument();
    });

    // Click the suggestion using mouseDown (component uses onMouseDown, not onClick)
    const suggestionItem = screen.getByText("123 Main St, Springfield, IL");
    fireEvent.mouseDown(suggestionItem);

    // react-hook-form's setValue updates internal form state; the visible
    // address input is uncontrolled (defaultValue), so we verify the hidden
    // coordinate fields are populated and the suggestion list is dismissed.
    await waitFor(() => {
      expect(screen.queryByText("123 Main St, Springfield, IL")).not.toBeInTheDocument();
    });

    // Verify hidden lat/lng fields are populated
    const form = screen.getAllByLabelText("Address")[0].closest("form")!;
    const latInput = form.querySelector('input[name="venue_lat"]') as HTMLInputElement;
    const lngInput = form.querySelector('input[name="venue_lng"]') as HTMLInputElement;
    expect(latInput.value).toBe("39.7817");
    expect(lngInput.value).toBe("-89.6501");
  });

  it('shows "Searching..." while geocoding is in flight', async () => {
    let resolveGeocoding!: (value: GeocodingResponse) => void;
    mockSearchAddress.mockReturnValue(
      new Promise<GeocodingResponse>((resolve) => {
        resolveGeocoding = resolve;
      }),
    );

    vi.useFakeTimers();
    render(<VenueEditor weddingId={1} />);

    const addressInput = screen.getAllByLabelText("Address")[0];

    await act(async () => {
      fireEvent.change(addressInput, { target: { value: "Main" } });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // The geocoding call is now in flight but unresolved — assert immediately
    // under fake timers (no waitFor needed since state is synchronous here)
    expect(screen.getByText("Searching...")).toBeInTheDocument();

    // Resolve to clean up
    await act(async () => {
      resolveGeocoding({ ok: true, results: [] });
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
    });
  });

  // --- Save tests (real timers, no debounce) ---

  it('shows "Venue details saved!" on successful save', async () => {
    mockUpdateWeddingDetails.mockResolvedValue({ success: true, wedding: { slug: "test-wedding" } });

    render(<VenueEditor weddingId={1} />);

    const buttons = screen.getAllByRole("button", { name: "Save Venue Details" });

    await act(async () => {
      fireEvent.click(buttons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText("Venue details saved!")).toBeInTheDocument();
    });
  });

  it("shows error message on failed save", async () => {
    mockUpdateWeddingDetails.mockResolvedValue({
      success: false,
      error: "update_failed" as const,
      message: "Failed to update wedding details.",
    });

    render(<VenueEditor weddingId={1} />);

    const buttons = screen.getAllByRole("button", { name: "Save Venue Details" });

    await act(async () => {
      fireEvent.click(buttons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to update wedding details.")).toBeInTheDocument();
    });
  });

  it("shows error message when updateWeddingDetails throws", async () => {
    mockUpdateWeddingDetails.mockRejectedValue(new Error("Network error"));

    render(<VenueEditor weddingId={1} />);

    const buttons = screen.getAllByRole("button", { name: "Save Venue Details" });

    await act(async () => {
      fireEvent.click(buttons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
    });
  });
});
