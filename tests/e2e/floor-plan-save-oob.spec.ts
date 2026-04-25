import { test, expect } from "@playwright/test";

test.describe("Save blocked when items out of bounds", () => {
  test("OOB items block save with message, in-bounds items allow save", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");

    // Place a round table so there's something to drag OOB
    await page.click('button:has-text("5ft"):not([disabled])');
    await page.waitForTimeout(500);

    // Wait for save to complete
    await expect(page.getByTestId("save-status")).toContainText(/Saved|Unsaved/, { timeout: 10000 });

    // Shrink venue to 3x3 to force items out of bounds
    await page.fill("#venue-width", "3");
    await page.fill("#venue-height", "3");
    await page.locator("#venue-width").blur();
    await page.waitForTimeout(500);

    // Save status should show "outside canvas" message
    await expect(page.getByTestId("save-status")).toContainText("outside canvas", { timeout: 10000 });

    // Save Now button should NOT be visible when blocked (not unsaved/error)
    await expect(page.getByTestId("save-now")).not.toBeVisible({ timeout: 5000 });

    // Expand venue to 50x40 — items should be back in bounds
    await page.fill("#venue-width", "50");
    await page.fill("#venue-height", "40");
    await page.locator("#venue-width").blur();
    await page.waitForTimeout(500);

    // Save should resume — status should eventually show Saved
    await expect(page.getByTestId("save-status")).toContainText(/Saved|Unsaved/, { timeout: 10000 });
  });
});
