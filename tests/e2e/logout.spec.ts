import { test, expect } from "@playwright/test";

test.describe("Logout", () => {
  test("couple user can log out and is redirected to /auth/login", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "alex@example.com");
    await page.fill('input[type="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Click logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(/\/auth\/login/);

    // Cannot access dashboard after logout
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("admin user can log out", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // Click logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
