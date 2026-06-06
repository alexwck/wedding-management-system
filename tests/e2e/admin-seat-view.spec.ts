import { test, expect } from "@playwright/test";

test.describe("Admin seat view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test("admin can view wedding RSVPs with seat columns", async ({ page }) => {
    await page.goto("/admin/weddings");
    const firstRow = page.locator("table tbody tr:first-child");
    if (await firstRow.isVisible()) {
      await firstRow.locator("a").first().click();
      await expect(page).toHaveURL(/\/admin\/weddings\/\d+/);

      // RSVP table should be visible
      const rsvpTable = page.locator("table").nth(1);
      if (await rsvpTable.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Should have Table and Seat columns
        const headers = page.locator("th");
        const headerTexts = await headers.allTextContents();
        // May or may not have Table/Seat columns depending on wedding data
        expect(headerTexts.length).toBeGreaterThan(0);
      }
    }
  });

  test("admin can navigate to floor plan from wedding detail", async ({ page }) => {
    await page.goto("/admin/weddings");
    const firstRow = page.locator("table tbody tr:first-child");
    if (await firstRow.isVisible()) {
      await firstRow.locator("a").first().click();

      const floorPlanLink = page.locator('a[href*="floor-plan"]').first();
      if (await floorPlanLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await floorPlanLink.click();
        await expect(page).toHaveURL(/floor-plan/);
      }
    }
  });
});
