import { test, expect } from "@playwright/test";

async function ensureWeddingUnlocked(page: import("@playwright/test").Page) {
  await page.goto('/auth/login');
  await page.fill('input[id="email"]', 'admin@example.com');
  await page.fill('input[id="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10000 });

  await page.goto('/admin/weddings/1');
  const unlockBtn = page.getByRole('button', { name: 'Unlock wedding' });
  if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await unlockBtn.click();
    await page.getByRole('button', { name: 'Lock wedding' }).waitFor({ state: 'visible', timeout: 5000 });
  }
}

test.describe("RSVP submission flow", () => {
  test.beforeEach(async ({ page, context }) => {
    await ensureWeddingUnlocked(page);
    // Clear RSVP token cookies so prior test submissions don't show confirmation card
    const cookies = await context.cookies();
    const rsvpCookies = cookies.filter((c) => c.name.startsWith("rsvp_token_"));
    if (rsvpCookies.length > 0) {
      await context.clearCookies(rsvpCookies);
    }
  });


  test("guest can submit RSVP and see confirmation", async ({ page }) => {
    const uniqueName = `Jane Doe ${Date.now()}`;

    // Visit the landing page
    await page.goto("/w/test-wedding-1");

    // Scroll to RSVP form
    await page.locator('#rsvp').scrollIntoViewIfNeeded();

    // Should still be on the landing page
    await expect(page).toHaveURL(/\/w\/test-wedding-1/);

    // Should see the form
    await expect(page.locator("form")).toBeVisible();

    // Fill out the RSVP form
    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.fill('textarea[id="dietaryNotes"]', "No nuts please");
    // Click labels since checkboxes are visually hidden
    await page.getByText("Vegetarian").click();
    await page.getByText("Baby Chair").click();

    // Submit the form
    await page.click('button[type="submit"]');

    // Should see confirmation card with heading "Your RSVP"
    await expect(page.locator("h2", { hasText: "Your RSVP" })).toBeVisible();
  });

  test("guest can submit declining RSVP", async ({ page }) => {
    const uniqueName = `Bob Smith ${Date.now()}`;

    await page.goto("/w/test-wedding-1");

    // Scroll to RSVP form
    await page.locator('#rsvp').scrollIntoViewIfNeeded();

    // Fill out with declining status
    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "declining");

    await page.click('button[type="submit"]');

    // Should see confirmation card with heading "Your RSVP"
    await expect(page.locator("h2", { hasText: "Your RSVP" })).toBeVisible();
  });

  test("RSVP form shows validation errors for missing fields", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    // Scroll to RSVP form
    await page.locator('#rsvp').scrollIntoViewIfNeeded();

    // Submit without filling anything
    await page.locator('button[type="submit"]').scrollIntoViewIfNeeded();
    await page.click('button[type="submit"]');

    // Should show validation error for guest name
    await expect(page.locator("text=/name is required/i")).toBeVisible();
  });
});
