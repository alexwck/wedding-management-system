import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LandingPage } from "@/components/landing-page";

vi.mock("@/components/gradient-backdrop", () => ({
  GradientBackdrop: ({ className }: { className?: string }) => <div data-testid="gradient-backdrop" className={className} />,
}));

describe("LandingPage", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders couple name", () => {
    render(<LandingPage coupleName="Alice & Bob" />);
    expect(screen.getByText("Alice & Bob")).toBeInTheDocument();
  });

  it("renders RSVP CTA button", () => {
    render(<LandingPage coupleName="Alice & Bob" />);
    const rsvpLink = screen.getByRole("link", { name: /RSVP Now/i });
    expect(rsvpLink).toBeInTheDocument();
    expect(rsvpLink).toHaveAttribute("href", "#rsvp");
  });

  it("renders wedding date when provided", () => {
    render(<LandingPage coupleName="Alice & Bob" weddingDate="2025-06-15T14:00:00Z" />);
    expect(screen.getByText(/June 15, 2025/i)).toBeInTheDocument();
  });

  it("renders venue name when provided", () => {
    render(<LandingPage coupleName="Alice & Bob" venueName="Grand Ballroom" />);
    expect(screen.getByText("Grand Ballroom")).toBeInTheDocument();
  });

  it("renders welcome message when provided", () => {
    render(<LandingPage coupleName="Alice & Bob" welcomeMessage="Join us!" />);
    expect(screen.getByText("Join us!")).toBeInTheDocument();
  });

  it("renders template image when URL provided", () => {
    render(<LandingPage coupleName="Alice & Bob" templateImageUrl="https://example.com/image.jpg" />);
    const img = screen.getByAltText(/Alice & Bob wedding invitation/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("applies focal point to image when provided", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="https://example.com/image.jpg"
        focalX={30}
        focalY={70}
      />
    );
    const img = screen.getByAltText(/Alice & Bob wedding invitation/i);
    expect(img).toHaveStyle("object-position: 30% 70%");
  });

  it("renders gradient backdrop fallback when no image", () => {
    render(<LandingPage coupleName="Alice & Bob" />);
    expect(screen.getByTestId("gradient-backdrop")).toBeInTheDocument();
  });
});
