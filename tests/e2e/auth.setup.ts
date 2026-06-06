import { test as setup, expect } from "@playwright/test";

// Two role-scoped storageState files written once per Playwright run.
// The `setup` project (no testMatch against specs) is the only consumer of this file;
// see playwright.config.ts. The two dependent projects (chromium, Mobile Chrome) read
// the JSON files via `use.storageState`.
//
// Each block intentionally mirrors the existing inline login flow the suite uses today,
// so spec parity is preserved: we are moving the login cost out of every spec, not
// changing what the login does.

const adminFile = "playwright/.auth/admin.json";
const coupleFile = "playwright/.auth/couple.json";

// Setup project starts with no cookies/storage so the sign-in flow is the source of truth.
setup.use({ storageState: { cookies: [], origins: [] } });

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('input[id="email"]', "admin@example.com");
  await page.fill('input[id="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
  // AGENTS.md gotcha: hydration waits - same networkidle guard the rest of the suite uses.
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: adminFile });
});

setup("authenticate as couple", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('input[id="email"]', "alex@example.com");
  await page.fill('input[id="password"]', "couple123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: coupleFile });
});
