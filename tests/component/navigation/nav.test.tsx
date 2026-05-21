import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Nav } from "@/components/nav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/dashboard"),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

vi.mock("@/app/actions/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

describe("Nav", () => {
  const defaultItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/rsvps", label: "RSVPs" },
    { href: "/dashboard/floor-plan", label: "Floor Plan" },
  ];

  beforeEach(() => {
    cleanup();
  });

  it("renders desktop sidebar on large viewports", () => {
    render(<Nav title="Couple Dashboard" items={defaultItems} />);
    expect(screen.getAllByText("Couple Dashboard").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("RSVPs")).toBeInTheDocument();
  });

  it("shows hamburger menu button on mobile", () => {
    render(<Nav title="Couple Dashboard" items={defaultItems} />);
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-label", "Open menu");
  });

  it("opens mobile navigation when hamburger is clicked", () => {
    render(<Nav title="Couple Dashboard" items={defaultItems} />);
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);

    expect(screen.getAllByText("Couple Dashboard").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
  });

  it("marks active link with correct styling", () => {
    render(<Nav title="Couple Dashboard" items={defaultItems} />);
    const activeLink = screen.getByText("Dashboard").closest("a");
    expect(activeLink).toHaveClass("glass-light", "text-slate-900");
  });

  it("renders logout button", () => {
    render(<Nav title="Couple Dashboard" items={defaultItems} />);
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders section headings when items have sections", () => {
    const itemsWithSections = [
      { href: "/admin", label: "Dashboard", section: "Management" },
      { href: "/admin/weddings", label: "Weddings", section: "Management" },
    ];
    render(<Nav title="Admin" items={itemsWithSections} />);
    expect(screen.getByText("Management")).toBeInTheDocument();
  });
});
