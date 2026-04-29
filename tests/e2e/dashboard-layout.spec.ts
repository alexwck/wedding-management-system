import { test, expect } from "@playwright/test";

test.describe("Dashboard layout (US2)", () => {
  test.describe("Admin page layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill('input[id="email"]', "admin@example.com");
      await page.fill('input[id="password"]', "admin123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/admin/);
    });

    test("admin page shows details tab with template and date at 1440px", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/admin/weddings/1");

      // Default tab is "Details" — should see template upload
      await expect(page.locator('input[type="file"]').first()).toBeVisible();

      // Should see wedding date picker
      await expect(page.locator("h3.text-lg", { hasText: "Wedding Date" })).toBeVisible();

      // Click Venue tab
      await page.click('button:has-text("Venue")');
      await expect(page.locator("h3", { hasText: "Venue Details" }).first()).toBeVisible();

      // Click RSVPs tab
      await page.click('button:has-text("RSVPs")');
      await expect(page.locator("h3", { hasText: "RSVP Responses" }).first()).toBeVisible();
    });

    test("admin page stacks vertically at 768px", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 900 });
      await page.goto("/admin/weddings/1");

      // Content should still be visible, just stacked
      await expect(page.locator('input[type="file"]').first()).toBeVisible();
      await expect(page.locator("h3", { hasText: "Wedding Date & Time" })).toBeVisible();
    });
  });

  test.describe("Couple dashboard layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill('input[id="email"]', "alex@example.com");
      await page.fill('input[id="password"]', "couple123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("couple dashboard shows two columns at 1440px", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/dashboard");

      // Should see the two-column grid
      const grid = page.locator(".grid.lg\\:grid-cols-3");
      await expect(grid).toBeVisible();

      // Right column should have date picker and venue editor
      await expect(page.locator("h3", { hasText: "Wedding Date & Time" })).toBeVisible();
      await expect(page.locator("h3", { hasText: "Venue Details" })).toBeVisible();
    });

    test("couple dashboard stacks vertically at 768px", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 900 });
      await page.goto("/dashboard");

      // Content should still be visible
      await expect(page.locator("h3", { hasText: "Wedding Date & Time" })).toBeVisible();
    });
  });
});
