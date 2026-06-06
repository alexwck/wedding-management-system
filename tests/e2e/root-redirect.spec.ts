import { test, expect } from "@playwright/test";

// File-wide: this spec tests root redirect behavior. Most tests are couple-role.
// The unauthenticated test below uses test.use({ storageState: empty }) inline.
// Per FR-002 in specs/014-e2e-speedup/spec.md.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("Root redirect", () => {
  test.describe("unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("redirects unauthenticated users from / to /auth/login", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test("redirects couple users from / to /dashboard", async ({ page }) => {
    // StorageState gives us a pre-authenticated couple session. Verify that
    // / redirects to /dashboard server-side.
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload to confirm the redirect is stable
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.describe("admin", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });

    test("redirects admin users from / to /admin", async ({ page }) => {
    // StorageState gives us a pre-authenticated admin session. Verify that
    // / redirects to /admin server-side.
    await page.goto("/");
    await expect(page).toHaveURL(/\/admin/);

    // Reload to confirm the redirect is stable
    await page.reload();
    await expect(page).toHaveURL(/\/admin/);
    });
  });
});
