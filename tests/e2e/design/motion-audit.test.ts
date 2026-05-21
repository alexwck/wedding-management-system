import { test, expect } from '@playwright/test';

/**
 * T009: Motion Design Audit E2E Test
 * Verifies all interactive elements follow DESIGN.md motion guidelines
 * - Hover: translateY(-2px) with 300ms transition
 * - Active: scale(0.98)
 * - Transition: cubic-bezier(0.4, 0, 0.2, 1)
 */

test.describe('Motion Design Audit', () => {
  test('buttons have motion hover class', async ({ page }) => {
    // Use login page which has a visible GlassButton
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button[type="submit"]').first();
    await expect(button).toBeVisible();

    const hasMotionHover = await button.evaluate((el) =>
      el.classList.contains('motion-hover')
    );
    expect(hasMotionHover).toBe(true);
  });

  test('buttons have motion active class', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button[type="submit"]').first();
    await expect(button).toBeVisible();

    const hasMotionActive = await button.evaluate((el) =>
      el.classList.contains('motion-active')
    );
    expect(hasMotionActive).toBe(true);
  });

  test('transition duration is 300ms', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button[type="submit"]').first();
    await button.scrollIntoViewIfNeeded();

    const transitionDuration = await button.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('transition-duration')
    );

    // Should be 0.3s or 300ms (or inherit from CSS variable)
    expect(transitionDuration).toMatch(/0\.3s|300ms/);
  });

  test('transition easing is cubic-bezier', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const button = page.locator('button[type="submit"]').first();
    await button.scrollIntoViewIfNeeded();

    const transitionTiming = await button.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('transition-timing-function')
    );

    // Should contain cubic-bezier
    expect(transitionTiming).toContain('cubic-bezier');
  });

  test('prefers-reduced-motion is respected', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const button = page.locator('button[type="submit"]').first();
    await button.scrollIntoViewIfNeeded();

    const transitionDuration = await button.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('transition-duration')
    );

    // Should be 0.01ms or very short with reduced motion
    expect(transitionDuration).toMatch(/0\.01ms|0s|1e-05s/);
  });
});
