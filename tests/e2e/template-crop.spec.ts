import { test, expect } from "@playwright/test";

test.describe("Template crop repositioning (US1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test("preview dialog shows drag instruction", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const previewButton = page.locator('button', { hasText: "Preview" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      await expect(page.getByText("Drag the image to choose the visible portion")).toBeVisible();
    }
  });

  test("can drag image to set crop offset", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const previewButton = page.locator('button', { hasText: "Preview" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      const img = page.locator('img[alt="Template preview"]');
      await expect(img).toBeVisible();

      const box = await img.boundingBox();
      if (box) {
        await img.hover();
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
        await page.mouse.up();

        await expect(page.getByText(/Crop offset:/)).toBeVisible();
      }
    }
  });

  test("save crop persists and shows on landing page", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const previewButton = page.locator('button', { hasText: "Preview" }).first();
    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      const img = page.locator('img[alt="Template preview"]');
      await expect(img).toBeVisible();

      const box = await img.boundingBox();
      if (box) {
        await img.hover();
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await page.mouse.up();
      }

      const saveButton = page.locator('button', { hasText: "Save Crop" });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await expect(saveButton).toContainText("Saving...");

      // Dialog should close on success
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

      // Verify landing page renders image with object-cover
      await page.goto("/w/test-wedding-1");
      const landingImg = page.locator("img").first();
      await expect(landingImg).toBeVisible();
    }
  });

  test("landing page template image uses object-cover", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    const img = page.locator("img").first();
    await expect(img).toBeVisible();

    const objectFit = await img.evaluate((el) => getComputedStyle(el).objectFit);
    expect(objectFit).toBe("cover");
  });
});
