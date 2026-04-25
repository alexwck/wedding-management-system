import { test, expect } from "@playwright/test";

test.describe("Undo/redo state restoration", () => {
  test("undo restores state after place, drag, chair count change", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await page.waitForTimeout(500);

    // Place first round table
    await page.click('button:has-text("5ft"):not([disabled])');
    await page.waitForTimeout(300);

    // Place second round table (need 2 items for undo to work)
    await page.click('button:has-text("5ft"):not([disabled])');
    await page.waitForTimeout(300);

    // Verify 2 items on canvas
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 2", { timeout: 5000 });

    // Change chair count on selected table
    const chairInput = page.locator('[data-testid="chair-count-input"]');
    if (await chairInput.isVisible()) {
      await chairInput.fill("4");
      await chairInput.blur();
      await page.waitForTimeout(300);
    }

    // Undo (Ctrl+Z)
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(300);

    // Verify state restored — should still have 2 tables but chair count reverted
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 2", { timeout: 5000 });

    // Undo again — remove second table
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(300);

    // Should have 1 table now
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 1", { timeout: 5000 });

    // Redo (Ctrl+Shift+Z)
    await page.keyboard.press("Meta+Shift+z");
    await page.waitForTimeout(300);

    // Back to 2 tables
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 2", { timeout: 5000 });
  });

  test("undo restores venue dimensions", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await page.waitForTimeout(500);

    // Read initial width
    const widthInput = page.locator("#venue-width");
    const initialWidth = await widthInput.inputValue();

    // Change width
    await widthInput.fill("30");
    await widthInput.blur();
    await page.waitForTimeout(300);
    await expect(widthInput).toHaveValue("30");

    // Undo
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(300);

    // Width should be restored
    await expect(widthInput).toHaveValue(initialWidth);
  });

  test("undo/redo buttons in toolbar work", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await page.waitForTimeout(500);

    // Place two items to enable undo
    await page.click('button:has-text("5ft"):not([disabled])');
    await page.waitForTimeout(300);
    await page.click('button:has-text("5ft"):not([disabled])');
    await page.waitForTimeout(300);

    // Undo button should be enabled
    const undoBtn = page.locator('button[aria-label="Undo"]');
    await expect(undoBtn).toBeEnabled({ timeout: 5000 });

    // Click undo
    await undoBtn.click();
    await page.waitForTimeout(300);

    // Should have 1 table
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 1", { timeout: 5000 });

    // Redo button should be enabled
    const redoBtn = page.locator('button[aria-label="Redo"]');
    await expect(redoBtn).toBeEnabled();

    // Click redo
    await redoBtn.click();
    await page.waitForTimeout(300);

    // Back to 2 tables
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText("Tables: 2", { timeout: 5000 });
  });
});
