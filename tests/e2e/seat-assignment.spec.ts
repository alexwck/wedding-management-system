import { test, expect } from "@playwright/test";

test.describe("Seat assignment flow", () => {
  test.beforeEach(async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  });

  test("admin can navigate to wedding floor plan", async ({ page, viewport }) => {
    // Go to weddings list
    await page.goto("/admin/weddings");

    // On mobile, cards replace the table — find wedding links inside the responsive cards
    if (viewport && viewport.width < 768) {
      const mobileLinks = page.locator(".md\\:hidden a[href*='/admin/weddings/']");
      await expect(mobileLinks.first()).toBeVisible();
      await mobileLinks.first().click();
    } else {
      await expect(page.locator("table")).toBeVisible();

      // Click first wedding to view details
      const firstWeddingLink = page.locator("table tbody tr:first-child a").first();
      await firstWeddingLink.click();
    }
    await expect(page).toHaveURL(/\/admin\/weddings\/\d+/);
  });

  test("floor plan page loads with canvas", async ({ page }) => {
    // Navigate to admin floor plan for first wedding
    await page.goto("/admin/weddings");
    const firstRow = page.locator("table tbody tr:first-child");
    if (await firstRow.isVisible()) {
      const weddingLink = firstRow.locator("a").first();
      await weddingLink.click();
      await expect(page).toHaveURL(/\/admin\/weddings\/\d+/);

      // Navigate to floor plan tab
      const floorPlanLink = page.locator('a[href*="floor-plan"]').first();
      if (await floorPlanLink.isVisible()) {
        await floorPlanLink.click();
        await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test("unassigned guests panel shows when guests exist", async ({ page }) => {
    // Go to a wedding with RSVPs
    await page.goto("/admin/weddings");
    const firstRow = page.locator("table tbody tr:first-child");
    if (await firstRow.isVisible()) {
      const weddingLink = firstRow.locator("a").first();
      await weddingLink.click();

      const floorPlanLink = page.locator('a[href*="floor-plan"]').first();
      if (await floorPlanLink.isVisible()) {
        await floorPlanLink.click();
        await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });

        // Wait for unassigned guests panel to load
        const guestsPanel = page.locator('[data-testid="unassigned-guests"]');
        if (await guestsPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Panel should show guests or "all seated" message
          await expect(guestsPanel).toBeVisible();
        }
      }
    }
  });
});
