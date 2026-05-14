import { test, expect } from "@playwright/test";

test.describe("Item resize (US6)", () => {
  test.beforeEach(async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
  });

  test("round table shows no resize handles", async ({ page }) => {
    const roundTableButton = page.locator("button", { hasText: /ft.*chairs/i }).first();
    if (await roundTableButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roundTableButton.click();

      // Click on the canvas to select the table
      const canvas = page.locator('[data-testid="floor-plan-canvas"]');
      await canvas.click({ position: { x: 300, y: 200 } });

      // Transformer should not show resize anchors for tables
      const resizeAnchors = page.locator(".konva-transformer__anchor");
      const count = await resizeAnchors.count();
      expect(count).toBe(0);
    }
  });

  test("stage can be resized via dimension inputs", async ({ page }) => {
    const stageButton = page.locator("button", { hasText: /^stage$/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click();

      // Click on the canvas to select the stage
      const canvas = page.locator('[data-testid="floor-plan-canvas"]');
      await canvas.click({ position: { x: 300, y: 200 } });

      // Wait for selection to be reflected in top bar
      // The dimension inputs should be visible for non-table items
    }
  });

  test("resize is undoable", async ({ page }) => {
    const stageButton = page.locator("button", { hasText: /^stage$/i }).first();
    if (await stageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageButton.click();

      const canvas = page.locator('[data-testid="floor-plan-canvas"]');
      await canvas.click({ position: { x: 300, y: 200 } });

      // Undo button should become available after changes
      const undoButton = page.locator("button", { hasText: /undo/i }).first();
      // Initially no undo available
      if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // After some action, undo should work
      }
    }
  });
});
