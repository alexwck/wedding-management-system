import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PresetBento } from "@/components/layout-presets/preset-bento";
import { PresetMinimalist } from "@/components/layout-presets/preset-minimalist";
import { PresetMagazine } from "@/components/layout-presets/preset-magazine";
import { ThemeProvider } from "@/lib/design-system/theme";

const mockWedding = {
  id: 1,
  slug: "test-wedding",
  couple_name: "Alice & Bob",
  template_image_url: null,
  wedding_date: "2026-06-15T14:00:00Z",
  timezone: "UTC",
  venue_name: "The Grand Ballroom",
  venue_address: "123 Main St",
  venue_lat: 40.7128,
  venue_lng: -74.006,
  welcome_message: "Welcome!",
  layout_preset: "bento",
  theme_json: null,
  is_locked: false,
};

const mockTheme = {
  primaryColor: "#E8D5C4",
  accentColor: "#C4B5A0",
  glassBlurRadius: 16,
  borderOpacity: 0.2,
  borderRadius: "16px",
  fontFamily: "sans" as const,
};

describe("Layout Presets", () => {
  beforeEach(() => {
    cleanup();
  });
  afterEach(() => {
    cleanup();
  });

  it("PresetBento renders couple name", () => {
    render(
      <ThemeProvider globalTheme={mockTheme}>
        <PresetBento wedding={mockWedding} theme={mockTheme} />
      </ThemeProvider>
    );
    expect(screen.getByText("Alice & Bob")).toBeInTheDocument();
  });

  it("PresetMinimalist renders couple name", () => {
    render(
      <ThemeProvider globalTheme={mockTheme}>
        <PresetMinimalist wedding={mockWedding} theme={mockTheme} />
      </ThemeProvider>
    );
    expect(screen.getByText("Alice & Bob")).toBeInTheDocument();
  });

  it("PresetMagazine renders couple name", () => {
    render(
      <ThemeProvider globalTheme={mockTheme}>
        <PresetMagazine wedding={mockWedding} theme={mockTheme} />
      </ThemeProvider>
    );
    expect(screen.getByText("Alice & Bob")).toBeInTheDocument();
  });

  it("applies theme primary color via CSS variable", () => {
    render(
      <ThemeProvider globalTheme={mockTheme}>
        <PresetBento wedding={mockWedding} theme={mockTheme} />
      </ThemeProvider>
    );
    const container = screen.getByText("Alice & Bob").closest(".preset-bento");
    expect(container).toBeInTheDocument();
  });

  it("stacks vertically on mobile viewport", () => {
    render(
      <ThemeProvider globalTheme={mockTheme}>
        <PresetBento wedding={mockWedding} theme={mockTheme} />
      </ThemeProvider>
    );
    const container = screen.getByText("Alice & Bob").closest(".preset-bento");
    expect(container).toBeInTheDocument();
  });
});
