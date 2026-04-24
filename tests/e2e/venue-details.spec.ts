import { test, expect } from "@playwright/test";

test.describe("Venue details on landing page (US2)", () => {
  test("guest sees venue info on landing page when data exists", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    // Venue info glass-panel should be visible (couple name heading)
    await expect(page.locator("h2", { hasText: "Alex & Sam" })).toBeVisible();

    // Welcome message should be visible
    await expect(page.locator("text=We can't wait to celebrate with you!")).toBeVisible();

    // Wedding date visible
    await expect(page.locator("text=June 15, 2026")).toBeVisible();

    // RSVP button still visible
    const ctaButton = page.locator("a", { hasText: "RSVP Now" });
    await expect(ctaButton).toBeVisible();
  });

  test("landing page without venue data returns 404 when no template image", async ({ page }) => {
    await page.goto("/w/jordan-taylor-wedding");

    // jordan-taylor-wedding has no template image, so it should 404
    await expect(page.locator("text=/not found/i")).toBeVisible();
  });
});

test.describe("Venue section on RSVP form (US3)", () => {
  test("guest sees venue map and nav buttons on RSVP form", async ({ page }) => {
    await page.goto("/w/test-wedding-1/rsvp");

    // Venue section should have address visible
    await expect(page.locator("text=123 Main St")).toBeVisible();

    // Map iframe should be present
    const mapFrame = page.locator('iframe[title="Venue map"]');
    await expect(mapFrame).toBeVisible();

    // Navigation buttons should be present
    await expect(page.locator("text=Open in Maps")).toBeVisible();
    await expect(page.locator("text=Navigate with Waze")).toBeVisible();

    // Welcome message
    await expect(page.locator("text=We can't wait to celebrate with you!")).toBeVisible();

    // RSVP form should still be visible
    await expect(page.locator("form")).toBeVisible();
  });

  test("RSVP form renders normally without venue data", async ({ page }) => {
    await page.goto("/w/jordan-taylor-wedding/rsvp");

    // No venue section
    await expect(page.locator("text=Open in Maps")).not.toBeVisible();

    // RSVP form should be present
    await expect(page.locator("form")).toBeVisible();
  });
});

test.describe("Admin venue editing (US1)", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");
  });

  test("admin can see venue editor on wedding detail page", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // Venue editor section should be visible
    await expect(page.locator("h3", { hasText: "Venue Details" })).toBeVisible();
    await expect(page.locator('input[id="venue"]')).toBeVisible();
    await expect(page.locator('input[id="venue_address"]')).toBeVisible();
    await expect(page.locator('textarea[id="welcome_message"]')).toBeVisible();
  });

  test("admin can update venue name", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // Clear and set new venue name
    const venueInput = page.locator('input[id="venue"]');
    await venueInput.clear();
    await venueInput.fill("Updated Venue Name");

    // Save
    await page.click('button:has-text("Save Venue Details")');

    // Success message
    await expect(page.locator("text=Venue details saved!")).toBeVisible();
  });
});

test.describe("Couple venue editing (US1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("couple can see venue editor on dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("h3", { hasText: "Venue Details" })).toBeVisible();
    await expect(page.locator('input[id="venue"]')).toBeVisible();
  });
});
