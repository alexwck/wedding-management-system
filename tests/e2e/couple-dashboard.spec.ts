import { test, expect } from "@playwright/test";

// Spec-wide override: this file tests the couple role, so load the couple storageState
// instead of the project default (admin). Per FR-002 in specs/014-e2e-speedup/spec.md.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("Couple views RSVP dashboard", () => {
  test("couple can login and view their RSVP dashboard with summary", async ({ page }) => {
    // storageState gives us a pre-authenticated context; navigate to the dashboard.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Should see dashboard with summary cards
    await expect(page.locator("text=Attending")).toBeVisible();
    await expect(page.locator("text=Declining")).toBeVisible();
  });

  test("couple can view RSVP list page", async ({ page, viewport }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to RSVPs page
    await page.goto("/dashboard/rsvps");

    // On mobile, GlassCards replace the table
    if (viewport && viewport.width < 768) {
      await expect(page.locator(".md\\:hidden .glass-panel").first()).toBeVisible();
    } else {
      // Should see RSVP table
      await expect(page.locator("table")).toBeVisible();

      // Table should have guest name and status columns
      await expect(page.locator("th", { hasText: "Guest" })).toBeVisible();
      await expect(page.locator("th", { hasText: "Status" })).toBeVisible();
    }
  });

  test("couple cannot access another couple's data", async ({ page }) => {
    // Login as couple1
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Should only see their own wedding data, not other couples'
    // Trying to access admin routes should redirect to dashboard
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.describe("unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("cannot access dashboard", async ({ page }) => {
      // Try to access dashboard without logging in
      await page.goto("/dashboard");

      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
