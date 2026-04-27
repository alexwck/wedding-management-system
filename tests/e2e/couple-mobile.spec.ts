import { test, expect } from "@playwright/test";

test.describe("Couple mobile dashboard flow (US3)", () => {
  async function loginAsCouple(page) {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  }

  test("couple sees bento RSVP summary cards on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsCouple(page);

    // RSVP summary cards should be visible
    await expect(page.locator("text=/Attending/i")).toBeVisible();
    await expect(page.locator("text=/Declining/i")).toBeVisible();
    await expect(page.locator("text=/Vegetarian/i")).toBeVisible();
    await expect(page.locator("text=/Baby Chairs/i")).toBeVisible();

    // Public preview link
    await expect(page.locator('a:has-text("Preview as Guest")')).toBeVisible();
  });

  test("couple can navigate RSVP list with pagination on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsCouple(page);

    // Navigate to RSVPs page
    await page.goto("/dashboard/rsvps");

    // Should see RSVP list heading
    await expect(page.locator("h2:has-text('RSVPs')")).toBeVisible();

    // Search input should be visible
    await expect(page.locator('input[placeholder="Search guests..."]')).toBeVisible();

    // Mobile card grid should show RSVP data (desktop table is hidden)
    const mobileCards = page.locator(".md\\:hidden");
    await expect(mobileCards.locator("text=/Dietary/i").first()).toBeVisible();
  });

  test("couple can edit venue on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsCouple(page);

    // Venue section should be visible with touch-friendly inputs
    const venueInput = page.locator('input[id="venue"]');
    const addressInput = page.locator('input[id="venue_address"]');
    const welcomeTextarea = page.locator('textarea[id="welcome_message"]');

    await expect(venueInput).toBeVisible();
    await expect(addressInput).toBeVisible();
    await expect(welcomeTextarea).toBeVisible();

    // Verify min-height for touch targets (44px)
    const venueBox = await venueInput.boundingBox();
    expect(venueBox?.height).toBeGreaterThanOrEqual(44);

    // Type a new welcome message
    await page.fill('textarea[id="welcome_message"]', "Welcome to our special day!");

    // Save button should be visible and clickable
    const saveButton = page.locator('button[type="submit"]:has-text("Save Venue Details")');
    await expect(saveButton).toBeVisible();
  });

  test("floor plan page shows device-not-supported on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsCouple(page);

    await page.goto("/dashboard/floor-plan");

    // Should see small-screen blocking message
    await expect(page.locator("text=/Floor plan editing requires a larger screen/i")).toBeVisible();
  });

  test("hamburger navigation opens and has correct links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsCouple(page);

    // Hamburger should be visible on mobile
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    await menuButton.click();

    // Nav links should be visible in sheet (scope to dialog to avoid hidden desktop sidebar)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText("Overview")).toBeVisible();
    await expect(dialog.getByText("RSVPs")).toBeVisible();
    await expect(dialog.getByText("Floor Plan")).toBeVisible();
    await expect(dialog.getByText("Logout")).toBeVisible();
  });

  test("tablet viewport shows desktop RSVP table instead of mobile cards", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginAsCouple(page);

    await page.goto("/dashboard/rsvps");

    // At 768px (md breakpoint), desktop table should be visible
    await expect(page.locator("table")).toBeVisible();
    // Mobile cards should be hidden
    await expect(page.locator(".md\\:hidden dl").first()).not.toBeVisible();
  });
});
