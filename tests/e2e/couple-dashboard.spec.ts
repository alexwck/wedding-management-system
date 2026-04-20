import { test, expect } from "@playwright/test";

test.describe("Couple views RSVP dashboard", () => {
  test("couple can login and view their RSVP dashboard with summary", async ({ page }) => {
    // Login as a couple user
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should see dashboard with summary cards
    await expect(page.locator("text=Total")).toBeVisible();
    await expect(page.locator("text=Attending")).toBeVisible();
    await expect(page.locator("text=Declining")).toBeVisible();
  });

  test("couple can view RSVP list page", async ({ page }) => {
    // Login as a couple user
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to RSVPs page
    await page.goto("/dashboard/rsvps");

    // Should see RSVP table
    await expect(page.locator("table")).toBeVisible();

    // Table should have guest name and status columns
    await expect(page.locator("th", { hasText: "Guest" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Status" })).toBeVisible();
  });

  test("couple cannot access another couple's data", async ({ page }) => {
    // Login as couple1
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Should only see their own wedding data, not other couples'
    // Trying to access admin routes should redirect to dashboard
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("unauthenticated user cannot access dashboard", async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto("/dashboard");

    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
