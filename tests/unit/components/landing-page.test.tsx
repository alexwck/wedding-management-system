import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Mock GradientBackdrop to avoid complex styling issues
vi.mock("@/components/gradient-backdrop", () => ({
  GradientBackdrop: () => <div data-testid="gradient" />,
}));

import { LandingPage } from "@/components/landing-page";

afterEach(cleanup);

describe("LandingPage", () => {
  it("renders couple name in image alt text", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/test.jpg"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Alice & Bob wedding invitation");
  });

  it("renders RSVP CTA with #rsvp anchor", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/test.jpg"
      />,
    );
    const rsvpLink = screen.getAllByRole("link").find((l) => l.textContent === "RSVP Now")!;
    expect(rsvpLink).toHaveAttribute("href", "#rsvp");
  });

  it("renders template image with correct src", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/template.jpg"
      />,
    );
    const img = screen.getAllByRole("img").find((i) => i.getAttribute("src") === "/template.jpg")!;
    expect(img).toBeDefined();
  });

  it("uses object-cover for image display", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
        templateImageUrl="/template.jpg"
      />,
    );
    const img = screen.getAllByRole("img").find((i) => i.getAttribute("src") === "/template.jpg")!;
    expect(img.className).toContain("object-cover");
  });

  it("shows fallback hero when no template image", () => {
    render(
      <LandingPage
        coupleName="Alice & Bob"
      />,
    );
    expect(screen.getByRole("heading", { name: "Alice & Bob" })).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
