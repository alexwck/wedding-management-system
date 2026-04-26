import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { VenueSection } from "@/components/venue-section";

describe("VenueSection map fallback", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders venue name and address", () => {
    render(
      <VenueSection
        venueName="The Grand Ballroom"
        venueAddress="123 Main St"
        venueLat={40.7128}
        venueLng={-74.006}
      />,
    );
    expect(screen.getByText("The Grand Ballroom")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("renders map iframe when coordinates provided", () => {
    render(
      <VenueSection
        venueName="The Grand Ballroom"
        venueAddress="123 Main St"
        venueLat={40.7128}
        venueLng={-74.006}
      />,
    );
    expect(screen.getByTitle("Venue map")).toBeInTheDocument();
  });

  it("shows fallback card when map times out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <VenueSection
        venueName="The Grand Ballroom"
        venueAddress="123 Main St"
        venueLat={40.7128}
        venueLng={-74.006}
      />,
    );

    expect(screen.getByTitle("Venue map")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByTitle("Venue map")).not.toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("shows retry button on map failure", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <VenueSection
        venueName="The Grand Ballroom"
        venueAddress="123 Main St"
        venueLat={40.7128}
        venueLng={-74.006}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("gracefully degrades when no coordinates provided", () => {
    render(
      <VenueSection
        venueName="The Grand Ballroom"
        venueAddress="123 Main St"
      />,
    );
    expect(screen.queryByTitle("Venue map")).not.toBeInTheDocument();
    expect(screen.getByText("The Grand Ballroom")).toBeInTheDocument();
  });
});
