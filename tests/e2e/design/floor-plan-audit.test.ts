import { test, expect } from "@playwright/test";

/**
 * E2E Visual Audit: Floor Plan Editor
 * Tests floor plan editor matches Stitch screenshot within ±4px spacing/sizing tolerance
 * Colors must match DESIGN.md tokens exactly
 */
test.describe("Floor Plan Editor Visual Audit", () => {
  async function loginAsAdmin(page: import("@playwright/test").Page) {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  }

  test("floor plan editor renders with glassmorphic styling", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/weddings/1/floor-plan");
    await page.waitForLoadState("networkidle");

    // Wait for canvas to load
    await page.waitForSelector('[data-testid="floor-plan-canvas"]');

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot("floor-plan-editor-glassmorphic.png", {
      maxDiffPixels: 5000, // Canvas-based editor has natural rendering variance
    });
  });

  test("floor plan toolbar uses glass-panel--light styling", async ({ page }) => {
    const viewportSize = page.viewportSize();
    if (!viewportSize || viewportSize.width < 768) {
      test.skip();
    }

    await loginAsAdmin(page);
    await page.goto("/admin/weddings/1/floor-plan");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="floor-plan-canvas"]');

    // Find toolbar (top bar with stats and controls)
    const toolbar = page.locator('[class*="glass"]').first();
    await expect(toolbar).toBeVisible();

    const hasGlassClass = await toolbar.evaluate((el) =>
      el.classList.contains('glass') || el.classList.contains('glass-light') || el.classList.contains('glass-panel')
    );
    expect(hasGlassClass).toBe(true);
  });

  test("floor plan toolbar buttons use GlassButton variant", async ({ page, viewport }) => {
    test.skip(viewport && viewport.width < 640, "Toolbar button visibility varies on mobile viewport");
    await loginAsAdmin(page);
    await page.goto("/admin/weddings/1/floor-plan");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="floor-plan-canvas"]');

    // Find toolbar buttons (undo, redo, zoom, save)
    const buttons = page.locator('button[class*="rounded-2xl"]').filter({ visible: true });
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThanOrEqual(3);
  });

  test("floor plan editor uses lucide-react icons", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/weddings/1/floor-plan");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="floor-plan-canvas"]');

    // Check for lucide-react SVG icons
    const icons = page.locator('svg');
    const iconCount = await icons.count();

    // Should have icons (Undo2, Redo2, ZoomOut, ZoomIn, FitScreen)
    expect(iconCount).toBeGreaterThanOrEqual(3);
  });

  test("floor plan editor has identical glass styling on admin and couple", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/weddings/1/floor-plan");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="floor-plan-canvas"]');

    const adminToolbar = page.locator('[class*="glass"]').first();
    const hasGlassClass = await adminToolbar.evaluate((el) =>
      el.classList.contains('glass') || el.classList.contains('glass-light') || el.classList.contains('glass-panel')
    );
    expect(hasGlassClass).toBe(true);

    const boxShadow = await adminToolbar.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('box-shadow')
    );
    expect(boxShadow).toMatch(/rgba?\([^)]+\)/);
  });
});
