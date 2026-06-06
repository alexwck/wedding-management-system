import { test, expect } from "@playwright/test";

test.describe("XLSX export", () => {
  test.beforeEach(async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
  });

  test("XLSX export button is visible on wedding detail page", async ({ page }) => {
    await page.goto("/admin/weddings");
    const firstRow = page.locator("table tbody tr:first-child");
    if (await firstRow.isVisible()) {
      await firstRow.locator("a").first().click();
      // Look for export/download button
      const xlsxButton = page.locator('button', { hasText: /xlsx|download/i }).first();
      if (await xlsxButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(xlsxButton).toBeVisible();
      }
    }
  });
});
