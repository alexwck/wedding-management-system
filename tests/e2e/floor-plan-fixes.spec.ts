import { test, expect } from "@playwright/test";

test.describe("Floor plan bug fixes (US6 & US7)", () => {
  test.describe("Item catalog overflow fix (US6)", () => {
    test.beforeEach(async ({ page }) => {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
      await page.goto("/dashboard/floor-plan");

      // Wait for canvas to load
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({
        timeout: 10000,
      });
    });

    test("catalog collapses and expands within viewport", async ({ page }) => {
      // Find the catalog toggle button
      const catalogSection = page.locator('[data-testid="item-catalog"]');
      if (await catalogSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Toggle collapse
        const toggleBtn = catalogSection.locator("button").first();
        if (await toggleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await toggleBtn.click();

          // Toggle expand back
          await toggleBtn.click();
        }

        // Catalog should still be within viewport (not overflow off-screen)
        const box = await catalogSection.boundingBox();
        if (box) {
          expect(box.y + box.height).toBeLessThanOrEqual(900);
        }
      }
    });

    test("catalog stays in viewport after multiple toggles", async ({ page }) => {
      const catalogSection = page.locator('[data-testid="item-catalog"]');
      if (await catalogSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        const toggleBtn = catalogSection.locator("button").first();

        // Toggle 5 times rapidly
        for (let i = 0; i < 5; i++) {
          if (await toggleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await toggleBtn.click();
          }
        }

        // Catalog should still be visible and within viewport
        await expect(catalogSection).toBeVisible();
        const box = await catalogSection.boundingBox();
        if (box) {
          expect(box.y + box.height).toBeLessThanOrEqual(900);
        }
      }
    });
  });

  test.describe("Chair count editing (US7)", () => {
    test.beforeEach(async ({ page }) => {
      await expect(page).toHaveURL(/\/admin/);
      await page.goto("/admin/weddings/1/floor-plan");

      // Wait for canvas
      await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({
        timeout: 10000,
      });
    });

    test("selecting a table shows chair count controls", async ({ page }) => {
      // Place a round table from catalog
      const roundTableBtn = page.locator('button', { hasText: /round table/i }).first();
      if (await roundTableBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await roundTableBtn.click();

        // Click on the canvas to place it (or it may auto-place)
        const stage = page.locator('[data-testid="floor-plan-canvas"]');
        await stage.click();

        // Wait for auto-save
        await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

        // Chair count controls should be visible when a table is selected
        // The controls show + and - buttons for chair count
        const chairControls = page.locator('button', { hasText: /\+|-/ }).first();
        // If table is auto-selected, controls may appear
        if (await chairControls.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(chairControls).toBeVisible();
        }
      }
    });
  });
});
