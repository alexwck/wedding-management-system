import { test, expect } from "@playwright/test";

async function ensureWeddingUnlocked(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.fill('input[id="email"]', "admin@example.com");
  await page.fill('input[id="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 20000 });

  await page.goto("/admin/weddings/1");
  const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
  if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await unlockBtn.click();
    await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
  }
}

test.describe("RSVP single-page experience", () => {
  test.beforeEach(async ({ page }) => {
    await ensureWeddingUnlocked(page);
  });

  test.afterEach(async ({ page }) => {
    await ensureWeddingUnlocked(page);
  });


  test("hero with image shows RSVP form, submit RSVP", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    // Wedding 1 (test-wedding-1) has template image
    await page.goto("/w/test-wedding-1");

    // Hero image should be visible
    await expect(page.locator("img[alt*='wedding invitation']")).toBeVisible();

    // Scroll to RSVP form
    await page.locator('#rsvp').scrollIntoViewIfNeeded();

    // RSVP form heading should be visible
    await expect(page.getByText(/RSVP for/)).toBeVisible();

    // Submit an RSVP
    await page.fill("#guestName", `E2E Guest ${Date.now()}`);
    await page.click('button[type="submit"]');
    // After submission, page shows confirmation card (cookie triggers server re-render)
    await expect(page.locator("h2:has-text('Your RSVP')")).toBeVisible({ timeout: 10000 });
  });

  test("fallback hero for wedding without template image", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    // Wedding 2 has no template image
    await page.goto("/w/jordan-taylor-wedding");

    // No 404 — page should render
    await expect(page.locator("body")).not.toContainText("404");

    // Fallback hero should show couple name
    await expect(page.locator("h1").first()).toHaveText("Jordan \u0026 Taylor");

    // RSVP form should still be on the same page
    await expect(page.getByText(/RSVP for/)).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Always unlock wedding 1 after each test to avoid breaking subsequent tests
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    await page.goto("/admin/weddings/1");
    const unlockBtn = page.getByRole("button", { name: "Unlock wedding" });
    if (await unlockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.click();
      await page.getByRole("button", { name: "Lock wedding" }).waitFor({ state: "visible", timeout: 5000 });
    }
  });

  test("locked wedding shows RSVP is closed", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Chromium only to avoid DB race conditions");

    // Lock wedding 1 via admin
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/admin/weddings/1");
    const lockBtn = page.getByRole("button", { name: "Lock wedding" });
    await expect(lockBtn).toBeVisible({ timeout: 5000 });
    await lockBtn.click();

    // Wait for toggle to reflect locked state before navigating
    await expect(page.getByRole("button", { name: "Unlock wedding" })).toBeVisible({ timeout: 5000 });

    // Visit public page as guest (cache-bust to avoid stale server render)
    await page.goto(`/w/test-wedding-1?t=${Date.now()}`);
    await expect(page.locator("text=RSVP is now closed")).toBeVisible({ timeout: 10000 });

    // Unlock
    await page.goto("/admin/weddings/1");
    await page.getByRole("button", { name: "Unlock wedding" }).click();
  });
});
