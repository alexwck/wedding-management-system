import { test, expect } from "@playwright/test";

test.describe("Admin lock/unlock wedding", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure wedding 1 starts unlocked
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await page.goto("/admin/weddings/1");
    const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
    if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.click();
      await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
    }
  });

  test.afterEach(async ({ page }) => {
    // Always unlock wedding 1 after each test to avoid breaking other tests
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await page.goto("/admin/weddings/1");
    const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
    if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.click();
      await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
    }
  });

  test("admin can lock and unlock a wedding", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate directly to wedding 1 (Alex & Sam)
    await page.goto("/admin/weddings/1");

    // Lock the wedding
    const lockBtn = page.getByRole("button", { name: "Lock wedding" });
    await expect(lockBtn).toBeVisible({ timeout: 5000 });
    await lockBtn.click();
    const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
    await expect(unlockBtn).toBeVisible({ timeout: 5000 });

    // Login as couple (alex@example.com owns wedding 1)
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Floor plan should be view-only
    await page.goto("/dashboard/floor-plan");
    await page.reload();
    await expect(page.locator("#venue-width")).toBeDisabled({ timeout: 10000 });
    await expect(page.locator("#venue-height")).toBeDisabled();
    await expect(page.locator('[data-testid="save-now"]')).not.toBeVisible();

    // Unlock as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/admin/weddings/1");
    await expect(page.getByRole("button", { name: "Unlock wedding" })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Unlock wedding" }).click();
    await expect(page.getByRole("button", { name: "Lock wedding" })).toBeVisible({ timeout: 5000 });

    // Couple floor plan should be editable again
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator("#venue-width")).toBeEnabled({ timeout: 10000 });
    await expect(page.locator("#venue-height")).toBeEnabled();
  });
});
