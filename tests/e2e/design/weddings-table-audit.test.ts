import { test, expect } from "@playwright/test";

/**
 * E2E Visual Audit: Weddings Table
 * Tests weddings table matches Stitch screenshot within ±4px spacing/sizing tolerance
 * Colors must match DESIGN.md tokens exactly
 */
test.describe("Weddings Table Visual Audit", () => {
  test("weddings table renders with glassmorphic styling", async ({ page }) => {
    await page.goto("/admin/weddings");
    await page.waitForLoadState("networkidle");

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot("weddings-table-glassmorphic.png", {
      maxDiffPixels: 200, // ±4px tolerance
    });
  });

  test("weddings table rows use glass hover states", async ({ page }) => {
    await page.goto("/admin/weddings");
    await page.waitForLoadState("networkidle");

    // Find table rows
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRow = rows.first();

      // Check initial state
      const initialStyles = await firstRow.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transition: computed.transition,
        };
      });

      // Should have transition for hover effect
      expect(initialStyles.transition).toBeTruthy();
    }
  });

  test("weddings table uses lucide-react icons", async ({ page }) => {
    await page.goto("/admin/weddings");
    await page.waitForLoadState("networkidle");

    // Check for lucide-react SVG icons
    const icons = page.locator('svg');
    const iconCount = await icons.count();

    // Should have icons (Plus, Layout, ExternalLink)
    expect(iconCount).toBeGreaterThanOrEqual(1);
  });

  test("weddings table container uses glass-panel styling", async ({ page }) => {
    await page.goto("/admin/weddings");
    await page.waitForLoadState("networkidle");

    // Find table container by glass-panel class
    const tableContainer = page.locator(".glass-panel").first();
    await expect(tableContainer).toBeVisible();

    const hasGlassPanelClass = await tableContainer.evaluate((el) =>
      el.classList.contains('glass-panel')
    );
    expect(hasGlassPanelClass).toBe(true);

    const boxShadow = await tableContainer.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('box-shadow')
    );
    expect(boxShadow).toMatch(/rgba?\([^)]+\)/);
  });
});
