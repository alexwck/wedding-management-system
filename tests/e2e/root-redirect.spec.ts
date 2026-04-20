import { test, expect } from "@playwright/test";

test.describe("Root redirect", () => {
  test("redirects unauthenticated users from / to /auth/login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("redirects couple users from / to /dashboard", async ({ page }) => {
    // Sign in as couple user
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "alex@example.com");
    await page.fill('input[type="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Navigate to root
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("redirects admin users from / to /admin", async ({ page }) => {
    // Sign in as admin user
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // Navigate to root
    await page.goto("/");
    await expect(page).toHaveURL(/\/admin/);
  });
});
