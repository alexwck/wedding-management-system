import { test, expect } from "@playwright/test";

test.describe("Cross-role access control", () => {
  test("admin is redirected from /dashboard to /admin", async ({ page }) => {
    // Default storageState is admin; visit a route the server redirects from /dashboard
    await page.goto("/admin");
    await page.waitForURL(/\/admin/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin/);
  });

  test.describe("couple", () => {
    test.use({ storageState: "playwright/.auth/couple.json" });

    test("is redirected from /admin to /dashboard", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
