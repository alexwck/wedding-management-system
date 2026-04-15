import { test, expect } from "@playwright/test";

test.describe("Duplicate RSVP prevention", () => {
  test("submitting RSVP with same name shows duplicate error", async ({ page }) => {
    const uniqueName = `Dup Guest ${Date.now()}`;

    // Submit a valid RSVP first
    await page.goto("/w/test-wedding-1/rsvp");

    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // Should see confirmation
    await expect(page.locator("h1", { hasText: /thank you/i })).toBeVisible();

    // Navigate back to RSVP form and try same name
    await page.goto("/w/test-wedding-1/rsvp");

    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // Should see duplicate error message
    await expect(
      page.locator("text=/already submitted an RSVP/i")
    ).toBeVisible();
  });

  test("duplicate check is case-insensitive", async ({ page }) => {
    const uniqueName = `Case Guest ${Date.now()}`;

    // Submit a valid RSVP first
    await page.goto("/w/test-wedding-1/rsvp");

    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    await expect(page.locator("h1", { hasText: /thank you/i })).toBeVisible();

    // Try with different case
    await page.goto("/w/test-wedding-1/rsvp");

    await page.fill('input[id="guestName"]', uniqueName.toLowerCase());
    await page.selectOption('select[id="status"]', "declining");
    await page.click('button[type="submit"]');

    // Should see duplicate error
    await expect(
      page.locator("text=/already submitted an RSVP/i")
    ).toBeVisible();
  });
});
