import { test, expect } from "@playwright/test";

test.describe("Duplicate RSVP prevention", () => {
  test("submitting RSVP with same name shows duplicate error", async ({ page }) => {
    const uniqueName = `Dup Guest ${Date.now()}`;

    // Submit a valid RSVP first
    await page.goto("/w/test-wedding-1");

    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // After submission, page shows confirmation card (cookie triggers server re-render)
    await expect(page.locator("h2:has-text('Your RSVP')")).toBeVisible();

    // Navigate back to RSVP form and try same name
    await page.goto("/w/test-wedding-1");

    // Click Edit RSVP to show the form again
    await page.click('button:has-text("Edit RSVP")');

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
    await page.goto("/w/test-wedding-1");

    await page.fill('input[id="guestName"]', uniqueName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // After submission, page shows confirmation card
    await expect(page.locator("h2:has-text('Your RSVP')")).toBeVisible();

    // Try with different case
    await page.goto("/w/test-wedding-1");

    // Click Edit RSVP to show the form again
    await page.click('button:has-text("Edit RSVP")');

    await page.fill('input[id="guestName"]', uniqueName.toLowerCase());
    await page.selectOption('select[id="status"]', "declining");
    await page.click('button[type="submit"]');

    // Should see duplicate error
    await expect(
      page.locator("text=/already submitted an RSVP/i")
    ).toBeVisible();
  });
});
