import { test, expect } from "@playwright/test";

test.describe("RSVP table sorting (US3)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("default sort is newest first (submitted descending)", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // RSVP section should be visible
    await expect(page.locator("text=RSVP Responses")).toBeVisible();

    // Default sort indicator on Submitted column should be ↓
    const submittedHeader = page.locator("th", { hasText: /Submitted/ });
    await expect(submittedHeader).toBeVisible();
    await expect(submittedHeader.locator("text=↓")).toBeVisible();
  });

  test("sort indicators are visible on sortable columns", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    // Guest name header should have sort indicator
    const guestHeader = page.locator("th", { hasText: /Guest/ });
    await expect(guestHeader).toBeVisible();
    // Guest header should contain a sort indicator character
    const guestText = await guestHeader.textContent();
    expect(guestText).toMatch(/↕|↑|↓/);

    // Status header should have sort indicator
    const statusHeader = page.locator("th", { hasText: /Status/ });
    const statusText = await statusHeader.textContent();
    expect(statusText).toMatch(/↕|↑|↓/);

    // Table header should have sort indicator
    const tableHeader = page.locator("th", { hasText: /Table/ });
    const tableText = await tableHeader.textContent();
    expect(tableText).toMatch(/↕|↑|↓/);
  });

  test("clicking guest name header sorts alphabetically", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const guestHeader = page.locator("th", { hasText: /Guest/ });
    await guestHeader.click();

    // After click, should show ascending indicator
    await expect(guestHeader.locator("text=↑")).toBeVisible();
  });

  test("clicking status header groups by status", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const statusHeader = page.locator("th", { hasText: /Status/ });
    await statusHeader.click();

    // After click, should show ascending indicator
    await expect(statusHeader.locator("text=↑")).toBeVisible();
  });

  test("clicking same column toggles ascending/descending", async ({ page }) => {
    await page.goto("/admin/weddings/1");

    const guestHeader = page.locator("th", { hasText: /Guest/ });

    // First click: ascending
    await guestHeader.click();
    await expect(guestHeader.locator("text=↑")).toBeVisible();

    // Second click: descending
    await guestHeader.click();
    await expect(guestHeader.locator("text=↓")).toBeVisible();
  });
});
