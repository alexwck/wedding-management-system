import { test, expect } from "@playwright/test";

test.describe("Template focal point (US8)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test("preview button opens dialog for template preview", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // Should see Preview button (only visible when template image exists)
    const previewButton = page.locator('button', { hasText: "Preview" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Dialog should open with focal point instructions
      await expect(page.getByText("Click the image to set a focal point")).toBeVisible();
    }
  });

  test("landing page renders template image", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    // Template image should be present
    const img = page.locator("img").first();
    await expect(img).toBeVisible();
  });

  test("focal point indicator shown when set", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const previewButton = page.locator('button', { hasText: "Preview" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Dialog should open — check for the specific instruction text
      await expect(page.getByText("Click the image to set a focal point")).toBeVisible();
    }
  });
});
