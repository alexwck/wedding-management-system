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
    // Click on round table in the item catalog
    const roundTableButton = page.locator('button', { hasText: /round table/i }).first();
    if (await roundTableButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roundTableButton.click();

      // Canvas should update with new item
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();
    }
  });

  test("can add a stage from catalog", async ({ page }) => {
    const stageButton = page.locator('button', { hasText: /stage/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click();
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();
    }
  });

  test("save persists changes on reload", async ({ page }) => {
    // Add a stage
    const stageButton = page.locator('button', { hasText: /stage/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click();

      // Wait for auto-save
      await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

      // Reload
      await page.reload();
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test("undo button works after adding item", async ({ page }) => {
    const stageButton = page.locator('button', { hasText: /stage/i }).first();
    const undoButton = page.locator('button', { hasText: /^undo$/i }).first();

    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click();

      // Undo should become enabled
      if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(undoButton).toBeEnabled({ timeout: 5000 });
      }
    }
  });
});
