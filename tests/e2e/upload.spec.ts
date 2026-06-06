import { test, expect } from "@playwright/test";

test.describe("File upload validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    await page.goto("/admin/weddings/1");
    await page.waitForLoadState("networkidle");
  });

  test("shows error for oversized file", async ({ page }) => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, "a");

    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "large.jpg",
      mimeType: "image/jpeg",
      buffer: largeBuffer,
    });

    await expect(page.locator("text=5MB")).toBeVisible();
  });

  test("shows error for wrong format (GIF)", async ({ page }) => {
    const input = page.locator('input[type="file"]');
    await input.setInputFiles({
      name: "test.gif",
      mimeType: "image/gif",
      buffer: Buffer.from("test"),
    });

    await expect(page.locator("text=PNG and JPG")).toBeVisible();
  });
});
