import { test, expect } from "@playwright/test";

test.describe("RSVP submission flow", () => {
  test("guest can submit RSVP and see confirmation", async ({ page }) => {
    const uniqueName = `Jane Doe ${Date.now()}`;

    // Visit the landing page
    await page.goto("/w/test-wedding-1");

    // Click the CTA button to go to RSVP form
    await page.click('a[href="/w/test-wedding-1/rsvp"]');

    // Should be on the RSVP form page
    await expect(page).toHaveURL("/w/test-wedding-1/rsvp");

    // Should see the form
    await expect(page.locator("form")).toBeVisible();

    // Fill out the RSVP form
    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.fill('textarea[id="dietaryNotes"]', "No nuts please");
    await page.check('input[id="isVegetarian"]');
    await page.check('input[id="needsBabyChair"]');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should see confirmation message
    await expect(page.locator("h1", { hasText: /thank you/i })).toBeVisible();
  });

  test("guest can submit declining RSVP", async ({ page }) => {
    const uniqueName = `Bob Smith ${Date.now()}`;

    await page.goto("/w/test-wedding-1/rsvp");

    // Fill out with declining status
    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "declining");

    await page.click('button[type="submit"]');

    // Should see confirmation message
    await expect(page.locator("h1", { hasText: /thank you/i })).toBeVisible();
  });

  test("RSVP form shows validation errors for missing fields", async ({ page }) => {
    await page.goto("/w/test-wedding-1/rsvp");

    // Submit without filling anything
    await page.click('button[type="submit"]');

    // Should show validation error for guest name
    await expect(page.locator("text=/name is required/i")).toBeVisible();
  });
});
