import { test, expect } from "@playwright/test";

test.describe("Wedding date flow (US1)", () => {
  test.describe("Admin wedding date management", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill('input[id="email"]', "admin@example.com");
      await page.fill('input[id="password"]', "admin123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/admin/);
    });

    test("admin can set wedding date via datetime-local input", async ({ page }) => {
      await page.goto("/admin/weddings/1");

      // Should see date picker section
      await expect(page.locator("h3", { hasText: "Wedding Date & Time" })).toBeVisible();

      // Should see datetime-local input
      const dateInput = page.locator('input[type="datetime-local"]');
      await expect(dateInput).toBeVisible();

      // Set a date
      await dateInput.fill("2026-12-25T14:00");

      // Click save
      const saveButtons = page.locator('button', { hasText: "Save" });
      await saveButtons.first().click();

      // Should show success
      await expect(page.locator("text=Date saved!")).toBeVisible();
    });

    test("admin can see timezone selector", async ({ page }) => {
      await page.goto("/admin/weddings/1");

      // Should see timezone search input
      const tzInput = page.locator('input[placeholder="Search timezone..."]');
      await expect(tzInput).toBeVisible();
    });

    test("landing page displays wedding date with timezone", async ({ page }) => {
      // Note: date may differ from seed if admin tests ran first
      await page.goto("/w/test-wedding-1");

      // Should show the couple name
      await expect(page.locator("h1").filter({ hasText: /^Alex & Sam$/ })).toBeVisible();

      // Should show a wedding date with timezone offset (format: "Month Day, Year at H:MM PM GMT±N")
      const dateEl = page.locator("p").filter({ hasText: /\d{4} at \d+:\d+ [AP]M GMT[+-]\d+/ });
      await expect(dateEl).toBeVisible();
    });
  });

  test.describe("Couple wedding date (no timezone selector)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/login");
      await page.fill('input[id="email"]', "alex@example.com");
      await page.fill('input[id="password"]', "couple123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("couple can see date picker without timezone selector", async ({ page }) => {
      await page.goto("/dashboard");

      // Should see date picker
      await expect(page.locator("h3", { hasText: "Wedding Date & Time" })).toBeVisible();

      // Should see datetime-local input
      const dateInput = page.locator('input[type="datetime-local"]');
      await expect(dateInput).toBeVisible();

      // Should NOT see timezone datalist (admin-only)
      await expect(page.locator('input[list="iana-timezones"]')).not.toBeVisible();
    });
  });
});
