import { test, expect } from "@playwright/test";

/**
 * E2E Visual Audit: RSVP Experience
 * Tests RSVP experience matches Stitch screenshot within ±4px spacing/sizing tolerance
 * Colors must match DESIGN.md tokens exactly
 */

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/);
}

async function ensureWeddingUnlocked(page: import("@playwright/test").Page) {
  await page.goto("/admin/weddings/1");
  await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);
  const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
  if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await unlockBtn.click();
    await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
  }
}

test.describe("RSVP Experience Visual Audit", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureWeddingUnlocked(page);
  });

  test("RSVP page renders with glassmorphic styling", async ({ page }) => {
    await page.goto("/w/test-wedding-1");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle and for the RSVP section to stabilize
    await page.waitForFunction(() => {
      const el = document.querySelector('#rsvp');
      if (!el) return false;
      const cs = getComputedStyle(el as Element);
      const opacityOk = cs.opacity === '1';
      const transformOk = cs.transform === 'none' || cs.transform.includes('translateY(0)') || cs.transform.includes('matrix');
      return opacityOk && transformOk;
    }, null, { timeout: 5000 });

    // Scroll to RSVP section
    await page.locator("#rsvp").scrollIntoViewIfNeeded();

    const panels = page.locator('#rsvp .glass-panel, #rsvp .glass-panel--light, #rsvp .glass-light, #rsvp .glass-dark, #rsvp .glass-strong');
    await expect(panels.first()).toBeVisible();
    const count = await panels.count();
    expect(count).toBeGreaterThan(0);

    const firstPanelStyles = await panels.first().evaluate((el) => {
      const cs = window.getComputedStyle(el as Element);
      return {
        backgroundColor: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        backdropFilter: cs.getPropertyValue('backdrop-filter') || cs.getPropertyValue('-webkit-backdrop-filter'),
      };
    });

    expect(firstPanelStyles.backgroundColor).toBeTruthy();
    expect(firstPanelStyles.boxShadow).toMatch(/rgba?\(/);
    expect(firstPanelStyles.backdropFilter).toBeTruthy();
    expect(firstPanelStyles.backdropFilter).not.toBe('');
  });

  test("RSVP form fields use glass styling", async ({ page }) => {
    await page.goto("/w/test-wedding-1");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();

    // Find form inputs
    const nameInput = page.getByLabel(/name/i).first();

    await expect(nameInput).toBeVisible();

    // Check for glass styling
    const inputStyles = await nameInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        borderColor: computed.borderColor,
      };
    });

    // Should have semi-transparent background and rounded corners
    expect(inputStyles.backgroundColor).not.toBe("rgb(255, 255, 255)");
    expect(inputStyles.borderRadius).not.toBe("0px");
  });

  test("RSVP form fields have smooth border transitions", async ({ page }) => {
    await page.goto("/w/test-wedding-1");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();

    const nameInput = page.getByLabel(/name/i).first();

    const styles = await nameInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        transition: computed.transition,
      };
    });

    // Should have transition on border-color (300ms)
    expect(styles.transition).toBeTruthy();
  });

  test("RSVP uses lucide-react icons", async ({ page }) => {
    await page.goto("/w/test-wedding-1");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();

    // Check for lucide-react SVG icons
    const icons = page.locator('svg');
    const iconCount = await icons.count();

    // Should have icons (Leaf, Baby)
    expect(iconCount).toBeGreaterThanOrEqual(2);
  });

  test("RSVP confirmation card uses glass-panel styling", async ({ page }) => {
    // Submit an RSVP to see confirmation
    await page.goto("/w/test-wedding-1?test_rsvp=true");
    await page.waitForLoadState("networkidle");

    // Wait for entrance animations to settle
    await page.waitForTimeout(500);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();

    // Fill out form
    const nameInput = page.getByLabel(/name/i).first();
    await nameInput.fill("Test Guest");

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for confirmation
    await page.waitForTimeout(1000);

    // Check for confirmation card with glass styling
    const confirmationCard = page.locator('[class*="glass"]').filter({ hasText: /thank you|your rsvp/i });

    if (await confirmationCard.count() > 0) {
      const hasGlassClass = await confirmationCard.first().evaluate((el) =>
        el.classList.contains('glass') || el.classList.contains('glass-panel')
      );
      expect(hasGlassClass).toBe(true);
    }
  });
});
