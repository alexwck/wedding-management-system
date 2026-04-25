import { test, expect } from "@playwright/test";

test.describe("Editable couple name", () => {
  test("edit couple name from couple dashboard", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Click on couple name to start editing
    const nameHeading = page.locator("h2.cursor-pointer").first();
    await nameHeading.click();
    await page.waitForTimeout(300);

    // Should show an input
    const input = page.locator("input.border-b-2");
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.fill("Alex & Sam Updated");
    await input.press("Enter");
    await page.waitForTimeout(1000);

    // Name should be updated
    await expect(page.locator("h2").first()).toContainText("Alex & Sam Updated", { timeout: 5000 });

    // Verify on public page
    await page.goto("/w/test-wedding-1");
    await expect(page.locator("text=Alex & Sam Updated")).toBeVisible({ timeout: 10000 });

    // Restore original name
    await page.goto("/dashboard");
    const nameHeading2 = page.locator("h2.cursor-pointer").first();
    await nameHeading2.click();
    await page.waitForTimeout(300);
    const input2 = page.locator("input.border-b-2");
    await input2.fill("Alex & Sam");
    await input2.press("Enter");
    await page.waitForTimeout(1000);
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
    await page.click('button:has-text("Lock")');
    await page.waitForTimeout(500);

    // Couple should see name without cursor-pointer (not editable)
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    const nameHeading = page.locator("h2").first();
    await expect(nameHeading).toContainText("Alex & Sam");
    await expect(nameHeading).not.toHaveClass(/cursor-pointer/);

    // Unlock
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/admin/weddings/1");
    await page.click('button:has-text("Unlock")');
    await page.waitForTimeout(500);
  });
});
