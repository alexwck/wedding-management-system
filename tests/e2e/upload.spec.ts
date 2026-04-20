import { test, expect } from "@playwright/test";

test.describe("File upload validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "alex@example.com");
    await page.fill('input[type="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("shows error for oversized file", async ({ page }) => {
    // Create a file larger than 5MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, "a");
    const file = new File([largeBuffer], "large.jpg", { type: "image/jpeg" });

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(file);

    await expect(page.locator("text=5MB")).toBeVisible();
  });

  test("shows error for wrong format (GIF)", async ({ page }) => {
    const file = new File(["test"], "test.gif", { type: "image/gif" });

    const input = page.locator('input[type="file"]');
    await input.setInputFiles(file);

    await expect(page.locator("text=PNG and JPG")).toBeVisible();
  });
});
