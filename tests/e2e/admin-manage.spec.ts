import { test, expect } from "@playwright/test";

test.describe("Admin manages weddings", () => {
  test("admin can login and upload a template image", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to weddings
    await page.click('a[href="/admin/weddings"]');

    // Should see wedding list
    await expect(page.locator("table")).toBeVisible();

    // Click first wedding to manage
    await page.locator("table tbody tr").first().click();

    // Should see upload area
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // Upload a template image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "template.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png-content"),
    });

    await page.getByRole("button", { name: "Upload Template" }).click();

    // Should see success message
    await expect(page.locator("text=Template uploaded successfully")).toBeVisible();
  });

  test("admin dashboard shows all weddings", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);

    // Dashboard should show wedding links
    await expect(page.locator("text=Weddings")).toBeVisible();
  });
});

test.describe("Admin manages couple accounts (US4)", () => {
  test("admin can create a couple account and wedding is created", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to couples page
    await page.click('a[href="/admin/couples"]');

    // Should see the couple creation form
    await expect(page.locator("text=Create Couple Account")).toBeVisible();

    // Fill out the form
    await page.fill('input[id="email"]', "newcouple@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="displayName"]', "Jane & John");
    await page.fill('input[id="coupleName"]', "Jane & John");

    // Submit
    await page.getByRole("button", { name: "Create Couple" }).click();

    // Should see success message
    await expect(page.locator("text=Couple account created")).toBeVisible();

    // New couple should appear in the couples list
    await expect(page.locator("text=Jane & John")).toBeVisible();
  });

  test("admin can view any wedding's RSVP data", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to weddings
    await page.click('a[href="/admin/weddings"]');

    // Should see wedding list
    await expect(page.locator("table")).toBeVisible();

    // Click first wedding to view its details including RSVP data
    await page.locator("table tbody tr").first().click();

    // Should see RSVP summary section (admin can see all RSVPs for any wedding)
    await expect(page.locator("text=RSVP Summary")).toBeVisible();
  });

  test("couple creation form validates required fields", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to couples page
    await page.click('a[href="/admin/couples"]');

    // Submit empty form
    await page.getByRole("button", { name: "Create Couple" }).click();

    // Should see validation errors
    await expect(page.locator("text=valid email")).toBeVisible();
  });
});
