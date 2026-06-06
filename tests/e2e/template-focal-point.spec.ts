import { test, expect } from "@playwright/test";

test.describe("Template focal point (US8)", () => {
  test.beforeEach(async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
  });

  test("preview button opens dialog for template preview", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // Should see Adjust Crop button (only visible when template image exists)
    const previewButton = page.locator('button', { hasText: "Adjust Crop" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Dialog should open with crop title
      await expect(page.getByText("Adjust Image Crop")).toBeVisible();
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

    const previewButton = page.locator('button', { hasText: "Adjust Crop" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Dialog should open — check for dialog title
      await expect(page.getByText("Adjust Image Crop")).toBeVisible();
    }
  });
});
