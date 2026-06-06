import { test, expect } from "@playwright/test";

// File-wide storageState: couple role is the modal test surface in this file. The 1 admin
// test overrides to admin storageState inline; the 1 unauthenticated test overrides to empty.
// Per FR-002 in specs/014-e2e-speedup/spec.md.
test.use({ storageState: "playwright/.auth/couple.json" });

test.describe("Couple floor plan — User Story 1", () => {
  test("couple can navigate to floor plan page, set dimensions, reload and verify persistence", async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to floor plan page
    await page.goto("/dashboard/floor-plan");

    // Should see dimension inputs with defaults or existing values
    const widthInput = page.locator('input[data-testid="venue-width"]');
    const heightInput = page.locator('input[data-testid="venue-height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Wait for initial auto-save to complete
    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Set new dimensions
    await widthInput.clear();
    await widthInput.fill("80");
    await heightInput.clear();
    await heightInput.fill("60");
    await widthInput.blur();

    // Save Now button should appear; click it before auto-save fires
    const saveNowBtn = page.locator('[data-testid="save-now"]');
    await saveNowBtn.waitFor({ state: "visible", timeout: 5000 });
    await saveNowBtn.click();
    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Reload the page
    await page.reload();
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();

    // Verify dimensions persisted
    const widthAfter = page.locator('input[data-testid="venue-width"]');
    const heightAfter = page.locator('input[data-testid="venue-height"]');
    await expect(widthAfter).toHaveValue("80");
    await expect(heightAfter).toHaveValue("60");
  });

  test("canvas renders with the configured dimensions", async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });

    // Canvas element should be visible
    const canvas = page.locator('[data-testid="floor-plan-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test("dimension inputs are validated (max 300)", async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");

    const widthInput = page.locator('input[data-testid="venue-width"]');
    await widthInput.clear();
    await widthInput.fill("500");

    // Should clamp to max 300
    await expect(widthInput).toHaveValue("300");
  });

  test.describe("unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("cannot access floor plan page", async ({ page }) => {
      await page.goto("/dashboard/floor-plan");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});

test.describe("Admin floor plan — User Story 1", () => {
  test.use({ storageState: "playwright/.auth/admin.json" });
  test("admin can navigate to a wedding's floor plan page and set dimensions", async ({ page, viewport }) => {
    test.skip(
      viewport && viewport.width < 640,
      "Floor plan requires a larger screen (min-width: 640px)"
    );
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to wedding 1's floor plan
    await page.goto("/admin/weddings/1/floor-plan");

    const widthInput = page.locator('input[data-testid="venue-width"]');
    const heightInput = page.locator('input[data-testid="venue-height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Wait for initial auto-save to complete
    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Set dimensions
    await widthInput.clear();
    await widthInput.fill("100");
    await heightInput.clear();
    await heightInput.fill("75");
    await widthInput.blur();

    // Save Now button should appear; click it before auto-save fires
    const saveNowBtn = page.locator('[data-testid="save-now"]');
    await saveNowBtn.waitFor({ state: "visible", timeout: 5000 });
    await saveNowBtn.click();
    await expect(page.locator('[data-testid="save-status"]')).toContainText(/saved/i, { timeout: 10000 });

    // Reload and verify
    await page.reload();
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible();
    await expect(page.locator('input[data-testid="venue-width"]')).toHaveValue("100");
    await expect(page.locator('input[data-testid="venue-height"]')).toHaveValue("75");
  });
});
