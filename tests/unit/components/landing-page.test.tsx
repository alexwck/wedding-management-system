import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock GradientBackdrop to avoid complex styling issues
vi.mock("@/components/gradient-backdrop", () => ({
  GradientBackdrop: () => <div data-testid="gradient" />,
}));

import { LandingPage } from "@/components/landing-page";

describe("LandingPage", () => {
  it("renders couple name in image alt text", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/test.jpg"
        slug="test-wedding"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Alice & Bob wedding invitation");
  });

  it("renders RSVP link with correct href", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/test.jpg"
        slug="test-wedding"
      />,
    );
    const rsvpLink = screen.getAllByRole("link").find((l) => l.textContent === "RSVP Now")!;
    expect(rsvpLink).toHaveAttribute("href", "/w/test-wedding/rsvp");
  });

  it("renders template image with correct src", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/template.jpg"
        slug="test"
      />,
    );
    const img = screen.getAllByRole("img").find((i) => i.getAttribute("src") === "/template.jpg")!;
    expect(img).toBeDefined();
  });
});
