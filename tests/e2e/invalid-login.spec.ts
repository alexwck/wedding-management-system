import { test, expect } from "@playwright/test";

test.describe("Invalid login", () => {
  test("shows error for wrong credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "nonexistent@example.com");
    await page.fill('input[id="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should remain on login page with error
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator("text=/invalid|error|failed|incorrect/i")).toBeVisible({ timeout: 5000 });
  });

  test("shows error for empty fields", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
