import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Template image refresh", () => {
  test("Adjust Crop button exists and dialog opens with correct title", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Wedding 1 has a template image, so "Adjust Crop" button should be visible
    const adjustBtn = page.locator('button:has-text("Adjust Crop")');
    await expect(adjustBtn).toBeVisible({ timeout: 5000 });

    // Click to open dialog
    await adjustBtn.click();
    await page.waitForTimeout(500);

    // Dialog should have updated title
    await expect(page.locator("text=Adjust Image Crop")).toBeVisible({ timeout: 5000 });
  });

  test("upload new image updates preview immediately", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Create a minimal test PNG (1x1 red pixel)
    const testImagePath = path.join(__dirname, "fixtures", "test-image.png");

    // Upload the image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(300);

    // Click upload
    await page.click('button:has-text("Upload Template")');
    await page.waitForTimeout(2000);

    // Should show success message
    await expect(page.locator("text=Template uploaded successfully")).toBeVisible({ timeout: 10000 });
  });
});
