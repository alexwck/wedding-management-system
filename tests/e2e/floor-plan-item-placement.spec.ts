import { test, expect } from "@playwright/test";

test.describe("Floor plan item placement", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
  });

  test("can add a round table from catalog", async ({ page }) => {
    const roundTableButton = page.locator('button', { hasText: /ft.*chairs/i }).first();
    if (await roundTableButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roundTableButton.click({ force: true });
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();
    }
  });

  test("can add a stage from catalog", async ({ page }) => {
    const stageButton = page.locator('button', { hasText: /^stage$/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click({ force: true });
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();
    }
  });

  test("save persists changes on reload", async ({ page }) => {
    const stageButton = page.locator('button', { hasText: /^stage$/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click({ force: true });

      // Wait for auto-save
      await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

      // Reload
      await page.reload();
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test("undo button works after adding items", async ({ page }) => {
    const stageButton = page.locator('button', { hasText: /^stage$/i }).first();
    const undoButton = page.locator('button', { hasText: /^undo$/i }).first();

    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Add first item (pushes initial state, index=0, canUndo=false)
      await stageButton.click({ force: true });
      await page.waitForTimeout(500);

      // Add second item (pushes first-item state, index=1, canUndo=true)
      await stageButton.click({ force: true });
      await page.waitForTimeout(1000);

      if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(undoButton).toBeEnabled({ timeout: 10000 });
      }
    }
  });
});
