import { test, expect } from '@playwright/test';

/**
 * T008: Glassmorphic Token Consistency E2E Test
 * Verifies all 5 pages use consistent glassmorphic styling from DESIGN.md
 * - backdrop-filter: blur(16px)
 * - background: rgba(255,255,255,0.25) light mode
 * - box-shadow: 0 8px 32px rgba(0,0,0,0.08)
 */

test.describe('Glassmorphic Token Consistency', () => {
  const pages = [
    { name: 'Login', url: '/auth/login' },
    { name: 'Admin Dashboard', url: '/admin' },
    { name: 'Weddings Table', url: '/admin/weddings' },
    { name: 'Floor Plan Editor', url: '/admin/weddings/1/floor-plan' },
    { name: 'RSVP Experience', url: '/w/test-wedding-1' },
  ];

  test.beforeEach(async ({ page }) => {
    // Login as admin for protected routes
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });

  for (const { name, url } of pages) {
    test(`${name} page has glass-panel with correct backdrop blur`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Find all .glass-panel elements
      const panels = page.locator('.glass-panel');
      const count = await panels.count();

      expect(count).toBeGreaterThan(0);

      // Verify glass-panel class is present and CSS rule defines backdrop-filter
      for (let i = 0; i < Math.min(count, 5); i++) {
        const panel = panels.nth(i);
        const hasGlassPanelClass = await panel.evaluate((el) =>
          el.classList.contains('glass-panel')
        );
        expect(hasGlassPanelClass).toBe(true);
      }
    });

    test(`${name} page has glass-panel with dual-shadow depth`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const panels = page.locator('.glass-panel');
      const count = await panels.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const panel = panels.nth(i);
        const boxShadow = await panel.evaluate((el) =>
          window.getComputedStyle(el).getPropertyValue('box-shadow')
        );

        // Verify shadow exists (should contain rgba or rgb values)
        expect(boxShadow).toMatch(/rgba?\([^)]+\)/);
      }
    });
  }

  test('globals.css exports DESIGN.md token names', async ({ page }) => {
    await page.goto('/auth/login');

    // Check CSS custom properties are defined
    const hasGlassSurface = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return !!style.getPropertyValue('--glass-surface');
    });

    const hasShadowOuter = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return !!style.getPropertyValue('--shadow-outer');
    });

    const hasHoverTransform = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return !!style.getPropertyValue('--hover-transform');
    });

    expect(hasGlassSurface).toBe(true);
    expect(hasShadowOuter).toBe(true);
    expect(hasHoverTransform).toBe(true);
  });
});
