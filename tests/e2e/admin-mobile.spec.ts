import { test, expect } from "@playwright/test";

test.describe("Admin mobile management flow (US2)", () => {
  async function loginAsAdmin(page) {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  }

  test("admin sees card grid wedding list on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page);

    // Navigate to weddings
    await page.goto("/admin/weddings");

    // On mobile, cards should be visible instead of table
    const mobileCards = page.locator(".md\\:hidden");
    await expect(mobileCards.locator('dt:has-text("Couple Name")').first()).toBeVisible();
    await expect(
      mobileCards.locator('a[href^="/admin/weddings/"]:not([href*="/create"]):not([href*="/floor-plan"])').first()
    ).toBeVisible();
  });

  test("admin can navigate wedding detail tabs on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page);

    await page.goto("/admin/weddings");
    await page
      .locator('.md\\:hidden a[href^="/admin/weddings/"]:not([href*="/create"]):not([href*="/floor-plan"])')
      .first()
      .click();

    // Should see tab triggers
    await expect(page.locator('button:has-text("Details")')).toBeVisible();
    await expect(page.locator('button:has-text("Venue")')).toBeVisible();
    await expect(page.locator('button:has-text("RSVPs")')).toBeVisible();
    await expect(page.locator('button:has-text("Preview")')).toBeVisible();

    // Switch to Venue tab
    await page.locator('button:has-text("Venue")').click();
    await expect(page.locator('h3:has-text("Venue Details")').first()).toBeVisible();

    // Switch to RSVPs tab
    await page.locator('button:has-text("RSVPs")').click();
    await expect(page.locator('h3:has-text("RSVP Responses")').first()).toBeVisible();
  });

  test("floor plan page shows device-not-supported on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page);

    await page.goto("/admin/weddings");
    await page
      .locator('.md\\:hidden a[href^="/admin/weddings/"]:not([href*="/create"]):not([href*="/floor-plan"])')
      .first()
      .click();

    // Navigate to floor plan
    await page.locator('a:has-text("Floor Plan")').click();

    // Should see small-screen blocking message
    await expect(page.locator("text=/Floor plan editing requires a larger screen/i")).toBeVisible();
  });

  test("admin can toggle wedding lock on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page);

    await page.goto("/admin/weddings");
    await page
      .locator('.md\\:hidden a[href^="/admin/weddings/"]:not([href*="/create"]):not([href*="/floor-plan"])')
      .first()
      .click();

    // Find lock toggle and click it
    const lockButton = page.locator('button[aria-pressed], button:has-text("Locked"), button:has-text("Unlocked")').first();
    await expect(lockButton).toBeVisible();

    const initialText = await lockButton.textContent();
    await lockButton.click();

    // Text should change after toggle
    await expect(async () => {
      const newText = await lockButton.textContent();
      expect(newText).not.toBe(initialText);
    }).toPass();

    // Toggle back to restore original state
    await lockButton.click();
    await expect(async () => {
      const restoredText = await lockButton.textContent();
      expect(restoredText).toBe(initialText);
    }).toPass();
  });

  test("hamburger navigation opens and has correct links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(page);

    // Hamburger should be visible on mobile
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();

    await menuButton.click();

    // Nav links should be visible in sheet (scope to dialog to avoid matching hidden desktop sidebar)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText("Overview")).toBeVisible();
    await expect(dialog.getByText("Weddings")).toBeVisible();
    await expect(dialog.getByText("Couples")).toBeVisible();
    await expect(dialog.getByText("Logout")).toBeVisible();
  });

  test("tablet viewport shows desktop table instead of mobile cards", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginAsAdmin(page);

    await page.goto("/admin/weddings");

    // At 768px (md breakpoint), desktop table should be visible
    await expect(page.locator("table")).toBeVisible();
    // Mobile cards should be hidden
    await expect(page.locator(".md\\:hidden dl").first()).not.toBeVisible();
  });
});
