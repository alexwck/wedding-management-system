import { test, expect } from "@playwright/test";

test.describe("Cross-role access control", () => {
  test("admin is redirected from /dashboard to /admin", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("couple is redirected from /admin to /dashboard", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "alex@example.com");
    await page.fill('input[type="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
