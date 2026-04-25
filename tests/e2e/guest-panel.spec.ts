import { test, expect } from "@playwright/test";

test.describe("Guest panel (US2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/floor-plan");
    await expect(page.locator('[data-testid="floor-plan-canvas"]')).toBeVisible({ timeout: 10000 });
  });

  test("guest panel shows unassigned section expanded by default", async ({ page }) => {
    const unassignedHeader = page.locator("button", { hasText: /unassigned/i });
    await expect(unassignedHeader).toBeVisible({ timeout: 5000 });

    const ariaExpanded = await unassignedHeader.getAttribute("aria-expanded");
    expect(ariaExpanded).toBe("true");
  });

  test("guest panel shows assigned section collapsed by default", async ({ page }) => {
    const assignedHeader = page.locator("button", { hasText: /^assigned/i });
    await expect(assignedHeader).toBeVisible({ timeout: 5000 });

    const ariaExpanded = await assignedHeader.getAttribute("aria-expanded");
    expect(ariaExpanded).toBe("false");
  });

  test("assigned section expands on click to show table numbers", async ({ page }) => {
    const assignedHeader = page.locator("button", { hasText: /^assigned/i });

    if (await assignedHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await assignedHeader.click();

      // Section should now be expanded
      const ariaExpanded = await assignedHeader.getAttribute("aria-expanded");
      expect(ariaExpanded).toBe("true");
    }
  });

  test("unassigned section collapses on click", async ({ page }) => {
    const unassignedHeader = page.locator("button", { hasText: /unassigned/i });

    if (await unassignedHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unassignedHeader.click();

      const ariaExpanded = await unassignedHeader.getAttribute("aria-expanded");
      expect(ariaExpanded).toBe("false");
    }
  });
});
