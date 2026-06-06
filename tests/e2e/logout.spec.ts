import { test, expect, type Page } from "@playwright/test";

async function clickLogout(page: Page) {
  // Desktop: logout is in the visible sidebar
  const sidebarLogout = page.locator("aside [data-testid='logout-button']");
  try {
    await sidebarLogout.waitFor({ state: "visible", timeout: 3000 });
    await sidebarLogout.click();
    return;
  } catch {
    // Mobile: open the hamburger menu, then click logout in the Sheet dialog
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("[role='dialog'] [data-testid='logout-button']").click();
  }
}

test.describe("Logout", () => {
  test("couple user can log out and is redirected to /auth/login", async ({ page }) => {
    await page.waitForURL(/\/dashboard/);

    await clickLogout(page);
    await expect(page).toHaveURL(/\/auth\/login/);

    // Cannot access dashboard after logout
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("admin user can log out", async ({ page }) => {
    await page.waitForURL(/\/admin/);

    await clickLogout(page);
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
