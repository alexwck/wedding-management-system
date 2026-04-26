import { test, expect } from "@playwright/test";

test.describe("Catalog disable when canvas full", () => {
  test("catalog items become disabled when canvas is too small", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");

    // Shrink venue to 3x3 — too small for any table or stage
    await page.fill("#venue-width", "3");
    await page.fill("#venue-height", "3");
    await page.locator("#venue-width").blur();

    // All table buttons and stage should be disabled
    const disabledButtons = page.locator('button[aria-label*="No space available"]');
    await expect(disabledButtons.first()).toBeVisible({ timeout: 10000 });
    // Should have multiple disabled items (tables + stage at minimum)
    const count = await disabledButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Expand venue to 50x40 — everything should fit
    await page.fill("#venue-width", "50");
    await page.fill("#venue-height", "40");
    await page.locator("#venue-width").blur();

    // All items should now be available
    await expect(disabledButtons.first()).not.toBeVisible({ timeout: 10000 });
  });
});
