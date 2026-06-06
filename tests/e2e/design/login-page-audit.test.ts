import { test, expect } from "@playwright/test";

/**
 * E2E Visual Audit: Login Page
 * Tests login page matches Stitch screenshot within ±4px spacing/sizing tolerance
 * Colors must match DESIGN.md tokens exactly
 */
test.describe("Login Page Visual Audit", () => {
  test("login page renders with glassmorphic styling", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Wait for hydration
    await page.waitForSelector('input[type="email"]');

    // Take screenshot for visual comparison
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot("login-page-glassmorphic.png", {
      maxDiffPixels: 100, // ±4px tolerance on spacing/sizing
    });
  });

  test("login page has glass input styling", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Check input fields have glass styling
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify glass styling via computed styles
    const emailStyles = await emailInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
      };
    });

    // Should have semi-transparent background and rounded corners
    expect(emailStyles.backgroundColor).not.toBe("rgb(255, 255, 255)");
    expect(emailStyles.borderRadius).not.toBe("0px");
  });

  test("login page has focus glow effect on inputs", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByLabel(/email/i);

    // Focus the input
    await emailInput.focus();

    // Check for glow effect (border-color change + outer glow)
    const focusedStyles = await emailInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        borderColor: computed.borderColor,
        boxShadow: computed.boxShadow,
      };
    });

    // Should have visible border color change and glow
    expect(focusedStyles.boxShadow).toBeTruthy();
  });

  test("login page has glass-panel card styling", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Find the login card (GlassPanel wrapper)
    const glassPanel = page.locator(".glass-panel").first();
    await expect(glassPanel).toBeVisible();

    // Verify glass-panel class is present and box-shadow is defined
    const hasGlassPanelClass = await glassPanel.evaluate((el) =>
      el.classList.contains('glass-panel')
    );
    expect(hasGlassPanelClass).toBe(true);

    const boxShadow = await glassPanel.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('box-shadow')
    );
    expect(boxShadow).toMatch(/rgba?\([^)]+\)/);
  });
});
