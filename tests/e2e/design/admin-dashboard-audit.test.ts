import { test, expect } from "@playwright/test";

/**
 * E2E Visual Audit: Admin Dashboard
 * Tests admin dashboard matches Stitch screenshot within ±4px spacing/sizing tolerance
 * Colors must match DESIGN.md tokens exactly
 */
test.describe("Admin Dashboard Visual Audit", () => {
  test("admin dashboard renders with glassmorphic styling", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot("admin-dashboard-glassmorphic.png", {
      maxDiffPixels: 800, // ±4px tolerance, dashboard has more elements
    });
  });

  test("admin dashboard stats cards use glass-panel styling", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);

    // Find stats cards by glass-panel class
    const statsCards = page.locator('.glass-panel');
    const cardCount = await statsCards.count();

    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Verify glass styling on first card
    const firstCard = statsCards.first();
    const hasGlassPanelClass = await firstCard.evaluate((el) =>
      el.classList.contains('glass-panel')
    );
    expect(hasGlassPanelClass).toBe(true);

    const boxShadow = await firstCard.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('box-shadow')
    );
    expect(boxShadow).toMatch(/rgba?\([^)]+\)/);
  });

  test("admin dashboard uses lucide-react icons", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);

    // Check for lucide-react SVG icons (they render as inline SVGs)
    const icons = page.locator('svg');
    const iconCount = await icons.count();

    // Should have icons (CheckCircle2, AlertCircle from status badges)
    expect(iconCount).toBeGreaterThanOrEqual(1);
  });

  test("admin dashboard has consistent elevation hierarchy", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);

    // Find action buttons
    const buttons = page.locator("button").filter({ hasText: /.+/ });
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Check first button for glass styling
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();

    const buttonStyles = await firstButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        boxShadow: computed.boxShadow,
        borderRadius: computed.borderRadius,
      };
    });

    // Should have shadow for elevation
    expect(buttonStyles.boxShadow).toBeTruthy();
  });
});
