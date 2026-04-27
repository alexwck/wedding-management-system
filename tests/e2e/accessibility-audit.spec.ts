import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility audit (axe-core)", () => {
  test("guest landing page meets WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/w/test-wedding-1");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag21aa", "wcag2aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("login page meets WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/auth/login");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag21aa", "wcag2aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("admin wedding list meets WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "admin@example.com");
    await page.fill('input[id="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await page.goto("/admin/weddings");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag21aa", "wcag2aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("couple dashboard meets WCAG 2.1 AA", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="password"]', "couple123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag21aa", "wcag2aa"])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
