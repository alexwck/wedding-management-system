import { test, expect } from "@playwright/test";

test.describe("Couple floor plan — User Story 1", () => {
  test("couple can navigate to floor plan page, set dimensions, reload and verify persistence", async ({ page }) => {
    // Login as a couple user
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to floor plan page
    await page.goto("/dashboard/floor-plan");
    await expect(page.locator("h2, h1")).toContainText(/floor plan/i);

    // Should see dimension inputs with defaults or existing values
    const widthInput = page.locator('input[data-testid="venue-width"]');
    const heightInput = page.locator('input[data-testid="venue-height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Set new dimensions
    await widthInput.clear();
    await widthInput.fill("80");
    await heightInput.clear();
    await heightInput.fill("60");

    // Wait for auto-save to trigger (5s debounce + network)
    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Reload the page
    await page.reload();

    // Verify dimensions persisted
    const widthAfter = page.locator('input[data-testid="venue-width"]');
    const heightAfter = page.locator('input[data-testid="venue-height"]');
    await expect(widthAfter).toHaveValue("80");
    await expect(heightAfter).toHaveValue("60");
  });

  test("canvas renders with the configured dimensions", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");

    // Canvas element should be visible
    const canvas = page.locator('[data-testid="floor-plan-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test("dimension inputs are validated (max 300)", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");

    const widthInput = page.locator('input[data-testid="venue-width"]');
    await widthInput.clear();
    await widthInput.fill("500");

    // Should clamp to max 300
    await expect(widthInput).toHaveValue("300");
  });

  test("unauthenticated user cannot access floor plan page", async ({ page }) => {
    await page.goto("/dashboard/floor-plan");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("Admin floor plan — User Story 1", () => {
  test("admin can navigate to a wedding's floor plan page and set dimensions", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);

    // Navigate to wedding 1's floor plan
    await page.goto("/admin/weddings/1/floor-plan");
    await expect(page.locator("h2, h1")).toContainText(/floor plan/i);

    const widthInput = page.locator('input[data-testid="venue-width"]');
    const heightInput = page.locator('input[data-testid="venue-height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Set dimensions
    await widthInput.clear();
    await widthInput.fill("100");
    await heightInput.clear();
    await heightInput.fill("75");

    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Reload and verify
    await page.reload();
    await expect(page.locator('input[data-testid="venue-width"]')).toHaveValue("100");
    await expect(page.locator('input[data-testid="venue-height"]')).toHaveValue("75");
  });
});
