import { test, expect } from "@playwright/test";

// File-wide storageState: this spec tests the couple role. Per FR-002 in
// specs/014-e2e-speedup/spec.md. The default project storageState is admin;
// individual tests that need admin can override with `test.use({ storageState: admin })`.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("Catalog disable when canvas full", () => {
  test("catalog items become disabled when canvas is too small", async ({ page, browserName, viewport }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");
    test.skip(
      viewport && viewport.width < 640,
      "Catalog disable test requires desktop viewport"
    );

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
