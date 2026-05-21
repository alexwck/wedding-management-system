import { test, expect } from "@playwright/test";

test.describe("Landing page rendering", () => {
  test("guest sees landing page with RSVP form inline on desktop", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    // Should render the wedding image
    const img = page.locator("img");
    await expect(img).toBeVisible();

    // RSVP form should be visible inline (no separate CTA button)
    await expect(page.locator("text=/RSVP for/")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("guest sees landing page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/w/test-wedding-1");

    // Should render the wedding image
    const img = page.locator("img");
    await expect(img).toBeVisible();

    // RSVP form should be visible inline
    await expect(page.locator("text=/RSVP for/")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("invalid slug shows not found", async ({ page }) => {
    await page.goto("/w/nonexistent-slug-12345");

    // Should show not found message
    await expect(page.locator("text=/not found/i")).toBeVisible();
  });

  test("landing page displays the seeded couple name", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    await expect(page.locator("h1", { hasText: "Alex & Sam" }).first()).toBeVisible();
  });
});
