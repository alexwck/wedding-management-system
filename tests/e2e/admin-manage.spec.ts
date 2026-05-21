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

test.describe("Admin manages weddings", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWeddingUnlocked(page);
  });

  test("admin can login and upload a template image", async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);

    // Navigate directly to first wedding
    await page.goto("/admin/weddings/1");
    await page.waitForLoadState("networkidle");

    // Should see upload area
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // Upload a template image (minimal valid 1x1 PNG)
    const fileInput = page.locator('input[type="file"]');
    const minPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==",
      "base64"
    );
    await fileInput.setInputFiles({
      name: "template.png",
      mimeType: "image/png",
      buffer: minPng,
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

    // Dashboard should show admin content
    await expect(page.locator("h1", { hasText: "Admin Dashboard Overview" })).toBeVisible();
  });
});

test.describe("Admin manages couple accounts (US4)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWeddingUnlocked(page);
  });

  test("admin can create a couple account and wedding is created", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // Navigate to couples page
    await page.goto("/admin/couples");

    // Should see the couple creation form
    await expect(page.locator("h3:has-text('Create Couple')")).toBeVisible();

    // Fill out the form
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const uniqueEmail = `newcouple-${uniqueId}@example.com`;
    const uniqueName = `Test Couple ${uniqueId}`;
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "password123");
    await page.fill('input[id="displayName"]', uniqueName);

    // Submit
    await page.getByRole("button", { name: "Create Couple" }).click();

    // Should see success message (or error for diagnosable failure)
    const successLocator = page.locator("div.bg-green-500\\/10");
    const errorLocator = page.locator("div.bg-destructive\\/10");
    await expect(successLocator.or(errorLocator)).toBeVisible({ timeout: 15000 });
    if (await errorLocator.isVisible()) {
      throw new Error(`Couple creation failed: ${await errorLocator.textContent()}`);
    }

    // Refresh to ensure list is updated (mobile can be slow)
    await page.reload();

    // New couple should appear in the couples list
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
  });

  test("admin can view any wedding's RSVP data", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate directly to first wedding
    await page.goto("/admin/weddings/1");

    // Click RSVPs tab to view RSVP data
    await page.click('button:has-text("RSVPs")');

    // Should see RSVP section (admin can see all RSVPs for any wedding)
    await expect(page.locator("h3", { hasText: "RSVP Responses" }).first()).toBeVisible();
  });

  test("couple creation form validates required fields", async ({ page }) => {
    // Login as admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to couples page
    await page.goto("/admin/couples");

    // Submit empty form
    await page.getByRole("button", { name: "Create Couple" }).click();

    // Should see validation errors
    await expect(page.locator("text=valid email")).toBeVisible();
  });
});
