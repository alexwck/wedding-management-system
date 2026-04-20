import { test, expect } from "@playwright/test";

async function clickLogout(page) {
  // Desktop: logout is in the visible sidebar
  const sidebarLogout = page.locator("aside [data-testid='logout-button']");
  if (await sidebarLogout.isVisible()) {
    await sidebarLogout.click();
    return;
  }
  // Mobile: open the hamburger menu, then click logout in the Sheet dialog
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("[role='dialog'] [data-testid='logout-button']").click();
}

test.describe("Logout", () => {
  test("couple user can log out and is redirected to /auth/login", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[type="email"]', "alex@example.com");
    await page.fill('input[type="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await clickLogout(page);
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

    await clickLogout(page);
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
