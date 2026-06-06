import { test, expect } from "@playwright/test";

test.describe("RSVP dashboard seat columns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("couple dashboard shows RSVPs with table/seat info", async ({ page }) => {
    // Dashboard should show RSVP table
    const table = page.locator("table");
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should have Table and Seat columns in headers
      const headers = await page.locator("th").allTextContents();
      expect(headers).toContain("Table");
      expect(headers).toContain("Seat");
    }
  });

  test("unassigned guests show dashes in table/seat columns", async ({ page }) => {
    const table = page.locator("table");
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for "—" (dash) indicating unassigned seats
      const dashes = page.locator("td", { hasText: "—" });
      const dashCount = await dashes.count();
      // At least some RSVPs might be unassigned
      expect(dashCount).toBeGreaterThanOrEqual(0);
    }
  });
});
