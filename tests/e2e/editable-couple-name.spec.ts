import { test, expect } from "@playwright/test";

test.describe("Editable couple name", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies to avoid cross-user session conflicts
    await context.clearCookies();
    // Ensure wedding 1 is unlocked before each test
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    await page.goto("/admin/weddings/1");
    const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
    if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.click();
      await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
    }
    // Restore couple name to seed value if needed
    const nameWrapper = page.locator("div.cursor-pointer").filter({ hasText: "Alex & Sam" }).first();
    if (!(await nameWrapper.isVisible({ timeout: 3000 }).catch(() => false))) {
      const updatedWrapper = page.locator("div.cursor-pointer").first();
      await updatedWrapper.click();
      const input = page.locator("input.border-b-2");
      await input.fill("Alex & Sam");
      await input.press("Enter");
      await page.locator("h2").filter({ hasText: "Alex & Sam" }).first().waitFor({ state: "visible", timeout: 5000 });
    }
  });

  test("edit couple name from couple dashboard", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Click on couple name wrapper to start editing
    const nameWrapper = page.locator("div.cursor-pointer").filter({ hasText: "Alex & Sam" }).first();
    await expect(nameWrapper).toBeVisible();
    await nameWrapper.click();

    // Should show an input (editable couple name uses border-b-2 styling)
    const input = page.locator("input.border-b-2");
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.fill("Alex & Sam Updated");
    await input.press("Enter");

    // Wait for input to disappear (save completed)
    await expect(input).not.toBeVisible({ timeout: 10000 });

    // Name should be updated
    await expect(page.locator("h2").filter({ hasText: "Alex & Sam Updated" }).first()).toBeVisible({ timeout: 5000 });

    // Verify on public page
    await page.goto("/w/test-wedding-1");
    await expect(page.locator("h1").filter({ hasText: "Alex & Sam Updated" }).first()).toBeVisible({ timeout: 10000 });

    // Restore original name
    await page.goto("/dashboard");
    const nameWrapper2 = page.locator("div.cursor-pointer").filter({ hasText: "Alex & Sam Updated" }).first();
    await nameWrapper2.click();
    const input2 = page.locator("input.border-b-2");
    await input2.fill("Alex & Sam");
    await input2.press("Enter");
  });

  test("couple name is not editable when locked", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    // Lock wedding as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/admin/weddings/1");
    await page.getByRole("button", { name: "Lock wedding" }).click();

    // Couple should see name without cursor-pointer (not editable)
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    const nameHeading = page.locator("h2").filter({ hasText: "Alex & Sam" }).first();
    await expect(nameHeading).toBeVisible();
    await expect(nameHeading).not.toHaveClass(/cursor-pointer/);

    // Unlock
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/admin/weddings/1");
    await page.getByRole("button", { name: "Unlock wedding" }).click();
  });

  test.afterEach(async ({ page }) => {
    // Always unlock wedding 1 and restore couple name after each test
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await page.goto("/admin/weddings/1");
    const unlockBtn = page.getByRole('button', { name: "Unlock wedding" });
    if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.click();
      await page.getByRole('button', { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
    }

    // Restore couple name to seed value
    const nameWrapper2 = page.locator("div.cursor-pointer").filter({ hasText: "Alex & Sam" }).first();
    if (!(await nameWrapper2.isVisible({ timeout: 3000 }).catch(() => false))) {
      const updatedWrapper = page.locator("div.cursor-pointer").first();
      if (await updatedWrapper.isVisible({ timeout: 3000 }).catch(() => false)) {
        await updatedWrapper.click();
        const input = page.locator("input.border-b-2");
        await input.fill("Alex & Sam");
        await input.press("Enter");
        await page.locator("h2").filter({ hasText: "Alex & Sam" }).first().waitFor({ state: "visible", timeout: 5000 });
      }
    }
  });
});
