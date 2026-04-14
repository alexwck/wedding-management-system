import { test, expect } from "@playwright/test";

test.describe("Admin manages weddings", () => {
  test("admin can login and upload a template image", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to weddings
    await page.click('a[href="/admin/weddings"]');

    // Should see wedding list
    await expect(page.locator("table")).toBeVisible();

    // Click first wedding to manage
    await page.locator("table tbody tr").first().click();

    // Should see upload area
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // Upload a template image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "template.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png-content"),
    });

    await page.getByRole("button", { name: "Upload Template" }).click();

    // Should see success message
    await expect(page.locator("text=Template uploaded successfully")).toBeVisible();
  });

  test("admin dashboard shows all weddings", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);

    // Dashboard should show wedding links
    await expect(page.locator("text=Weddings")).toBeVisible();
  });
});
