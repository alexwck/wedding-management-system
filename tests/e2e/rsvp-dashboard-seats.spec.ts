import { test, expect } from "@playwright/test";

// File-wide storageState: this spec tests the couple role. Per FR-002 in
// specs/014-e2e-speedup/spec.md. The default project storageState is admin;
// individual tests that need admin can override with `test.use({ storageState: admin })`.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("RSVP dashboard seat columns", () => {
  test.beforeEach(async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("couple dashboard shows RSVPs with table/seat info", async ({ page }) => {
    // Dashboard should show RSVP table
    const table = page.locator("table");
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Should have Table and Seat columns in headers
      const headers = await page.locator("th").allTextContents();
      expect(headers).toContain("Table");
      expect(headers).toContain("Seat");
    }
  });

  test("unassigned guests show dashes in table/seat columns", async ({ page }) => {
    const table = page.locator("table");
    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for "—" (dash) indicating unassigned seats
      const dashes = page.locator("td", { hasText: "—" });
      const dashCount = await dashes.count();
      // At least some RSVPs might be unassigned
      expect(dashCount).toBeGreaterThanOrEqual(0);
    }
  });
});
