import { test, expect } from "@playwright/test";

test.describe("Landing page rendering", () => {
  test("guest sees landing page with CTA button on desktop", async ({ page }) => {
    // Visit a wedding landing page with known slug
    // (seed data should provide a test slug)
    await page.goto("/w/test-wedding-1");

    // Should render the wedding image
    const img = page.locator("img");
    await expect(img).toBeVisible();

    // Should show CTA button
    const ctaButton = page.locator("a", { hasText: "RSVP Now" });
    await expect(ctaButton).toBeVisible();

    // CTA should link to RSVP anchor on same page
    await expect(ctaButton).toHaveAttribute("href", "#rsvp");
  });

  test("guest sees landing page on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/w/test-wedding-1");

    // Should render the wedding image
    const img = page.locator("img");
    await expect(img).toBeVisible();

    // Should show CTA button
    const ctaButton = page.locator("a", { hasText: "RSVP Now" });
    await expect(ctaButton).toBeVisible();
  });

  test("invalid slug shows not found", async ({ page }) => {
    await page.goto("/w/nonexistent-slug-12345");

    // Should show not found message
    await expect(page.locator("text=/not found/i")).toBeVisible();
  });
});
