import { test, expect, type Page } from "@playwright/test";

async function getTableCount(page: Page) {
  const text = await page.locator('[data-testid="canvas-stats"]').textContent().catch(() => "");
  const match = text?.match(/Tables(\d+)\s*Round/);
  return match ? parseInt(match[1], 10) : 0;
}

function roundText(count: number) {
  return new RegExp(`${count} Round${count !== 1 ? "s" : ""}`);
}

test.describe("Undo/redo state restoration", () => {
  test("undo removes placed items and redo restores them", async ({ page, browserName, viewport }) => {
    test.skip(
      browserName !== "chromium" || (viewport && viewport.width < 640),
      "Chromium only to avoid DB race conditions; floor plan requires min-width 640px"
    );

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });

    const initialTables = await getTableCount(page);

    // Place first round table
    const roundTableBtn = page.locator("button", { hasText: /^5ft$/ }).first();
    await expect(roundTableBtn).toBeVisible({ timeout: 10000 });
    await roundTableBtn.click();

    // Verify N+1 items
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 1), { timeout: 5000 });

    // Place second round table
    await roundTableBtn.click();

    // Verify N+2 items
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 2), { timeout: 5000 });

    // Undo once — removes both tables (history pushes before mutation)
    await page.keyboard.press("Meta+z");
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables), { timeout: 5000 });

    // Redo once — restores first added table
    await page.keyboard.press("Meta+Shift+z");
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 1), { timeout: 5000 });
  });

  test("undo restores venue dimensions", async ({ page, browserName, viewport }) => {
    test.skip(
      browserName !== "chromium" || (viewport && viewport.width < 640),
      "Chromium only to avoid DB race conditions; floor plan requires min-width 640px"
    );

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });

    // Read initial width
    const widthInput = page.locator("#venue-width");
    const initialWidth = await widthInput.inputValue();

    // Change width
    await widthInput.fill("30");
    await widthInput.blur();
    await expect(widthInput).toHaveValue("30");

    // Undo via toolbar button
    const undoBtn = page.locator('button[aria-label="Undo"]');
    await expect(undoBtn).toBeEnabled({ timeout: 5000 });
    await undoBtn.click();

    // Width should be restored
    await expect(widthInput).toHaveValue(initialWidth);
  });

  test("undo/redo buttons in toolbar work", async ({ page, browserName, viewport }) => {
    test.skip(
      browserName !== "chromium" || (viewport && viewport.width < 640),
      "Chromium only to avoid DB race conditions; floor plan requires min-width 640px"
    );

    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });

    const initialTables = await getTableCount(page);

    // Place two items to enable undo
    const roundTableBtn2 = page.locator("button", { hasText: /^5ft$/ }).first();
    await expect(roundTableBtn2).toBeVisible({ timeout: 10000 });
    await roundTableBtn2.click();
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 1), { timeout: 5000 });
    await roundTableBtn2.click();
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 2), { timeout: 5000 });

    // Undo button should be enabled
    const undoBtn = page.locator('button[aria-label="Undo"]');
    await expect(undoBtn).toBeEnabled({ timeout: 5000 });

    // Click undo — removes all added tables (pre-mutation snapshot)
    await undoBtn.click();
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables), { timeout: 5000 });

    // Redo button should be enabled
    const redoBtn = page.locator('button[aria-label="Redo"]');
    await expect(redoBtn).toBeEnabled();

    // Click redo — restores one table
    await redoBtn.click();
    await expect(page.locator('[data-testid="canvas-stats"]')).toContainText(roundText(initialTables + 1), { timeout: 5000 });
  });
});
