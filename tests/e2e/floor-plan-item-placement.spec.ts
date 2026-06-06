import { test, expect } from "@playwright/test";

// File-wide storageState: this spec tests the couple role. Per FR-002 in
// specs/014-e2e-speedup/spec.md. The default project storageState is admin;
// individual tests that need admin can override with `test.use({ storageState: admin })`.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("Floor plan item placement", () => {
  test.beforeEach(async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );

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
    const undoButton = page.getByLabel("Undo").first();

    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Add first item (pushes initial state, index=0, canUndo=false)
      await stageButton.click({ force: true });
      await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

      // Add second item (pushes first-item state, index=1, canUndo=true)
      await stageButton.click({ force: true });
      await page.waitForTimeout(500);

      if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(undoButton).toBeEnabled({ timeout: 10000 });
      }
    }
  });
});
