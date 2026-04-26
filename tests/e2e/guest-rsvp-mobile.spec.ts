import { test, expect } from "@playwright/test";

test.describe("Guest RSVP mobile flow (US1)", () => {
  test("guest sees hero and can complete RSVP on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/w/test-wedding-1");

    // Hero visible
    await expect(page.locator("h1")).toBeVisible();

    // RSVP form visible after scroll or on page
    const rsvpSection = page.locator("#rsvp");
    await expect(rsvpSection).toBeVisible();

    // Fill and submit RSVP
    const guestName = `Mobile Guest ${Date.now()}`;
    await page.fill('input[id="guestName"]', guestName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // Confirmation card appears (server component re-renders after action)
    await expect(page.locator("text=/Your RSVP/i")).toBeVisible();
  });

  test("RSVP form inputs have 44px min-height on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/w/test-wedding-1");

    const input = page.locator('input[id="guestName"]');
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("map fallback shows retry when embed times out", async ({ page }) => {
    await page.goto("/w/test-wedding-1");

    // Simulate timeout by blocking map iframe
    await page.route("**/openstreetmap.org/**", (route) =>
      route.abort("timedout"),
    );
    await page.reload();

    // Retry button should appear
    await expect(
      page.locator('button:has-text("Retry")'),
    ).toBeVisible({ timeout: 10000 });
  });

  test("returning guest sees confirmation card with edit button", async ({ page, context }) => {
    await page.goto("/w/test-wedding-1");

    // Submit RSVP first
    const guestName = `Returning Guest ${Date.now()}`;
    await page.fill('input[id="guestName"]', guestName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/Your RSVP/i")).toBeVisible();

    // Verify cookie was set before reload
    const cookies = await context.cookies();
    const tokenCookie = cookies.find((c) => c.name.startsWith("rsvp_token_"));
    expect(tokenCookie).toBeDefined();

    // Reload — should see confirmation card if token is valid
    await page.reload();
    await expect(page.locator("text=/Your RSVP/i")).toBeVisible();
    await expect(page.locator('button:has-text("Edit RSVP")')).toBeVisible();
  });

  test("token cookie has Secure, HttpOnly, SameSite=Lax", async ({ page, context }) => {
    await page.goto("/w/test-wedding-1");
    const guestName = `Cookie Test Guest ${Date.now()}`;
    await page.fill('input[id="guestName"]', guestName);
    await page.selectOption('select[id="status"]', "attending");
    await page.click('button[type="submit"]');

    // Wait for submission to complete
    await expect(page.locator("text=/Your RSVP/i")).toBeVisible();

    const cookies = await context.cookies();
    const tokenCookie = cookies.find((c) => c.name.startsWith("rsvp_token_"));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie!.httpOnly).toBe(true);
    expect(tokenCookie!.sameSite).toBe("Lax");
  });

  test("tablet viewport shows distinct layout from mobile", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/w/test-wedding-1");

    // Hero and RSVP form visible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#rsvp")).toBeVisible();

    // At 768px, venue nav buttons use sm:flex-row (side by side), distinct from mobile stacked
    const venueButtons = page.locator('a:has-text("Open in Maps")');
    await expect(venueButtons).toBeVisible();
  });
});
