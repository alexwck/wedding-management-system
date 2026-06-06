/**
 * Feature 014: auth.setup.ts + storageState + per-spec opt-in contract.
 *
 * This spec pins the E2E contract of the auth-reuse infrastructure. It runs against
 * the live dev server + local Supabase; it does not depend on any feature spec.
 *
 *   T-E2E-02: storageState JSON files have a valid Playwright shape
 *   T-E2E-03: a spec using test.use({ storageState: ... }) does NOT visit /auth/login
 *   T-E2E-04: a spec using test.use({ storageState: { cookies: [], origins: [] } })
 *              DOES visit /auth/login when accessing a protected route
 *   T-E2E-05: npx playwright test --list without CI shows only [setup, chromium]
 *   T-E2E-06: CI=1 npx playwright test --list shows [setup, chromium, Mobile Chrome]
 *
 * These are the regression locks for the feature. They are intentionally short and
 * self-contained so they can run as a smoke check before/after any change to
 * playwright.config.ts or auth.setup.ts.
 */

import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ADMIN_FILE = "playwright/.auth/admin.json";
const COUPLE_FILE = "playwright/.auth/couple.json";

test.describe("Auth-setup contracts (T-E2E-02..06)", () => {
  test("T-E2E-02: storageState JSON files have a valid Playwright shape", async () => {
    // The setup project writes these files on every Playwright run. They are not
    // committed (gitignored) but they MUST exist by the time any spec runs (because
    // the chromium project depends on the setup project).
    expect(existsSync(ADMIN_FILE), `missing ${ADMIN_FILE}`).toBe(true);
    expect(existsSync(COUPLE_FILE), `missing ${COUPLE_FILE}`).toBe(true);

    // Parse and validate the shape. Playwright's StorageState type is:
    //   { cookies: Cookie[], origins: OriginState[] }
    // where Cookie is { name, value, domain, path, expires, httpOnly, secure, sameSite }
    for (const path of [ADMIN_FILE, COUPLE_FILE]) {
      const raw = readFileSync(path, "utf-8");
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed.cookies), `${path}: cookies must be an array`).toBe(true);
      expect(Array.isArray(parsed.origins), `${path}: origins must be an array`).toBe(true);
      // At least one cookie should be the Supabase auth cookie
      const hasAuthCookie = parsed.cookies.some(
        (c: { name: string; domain: string }) =>
          c.name.includes("auth-token") || c.name.startsWith("sb-"),
      );
      expect(hasAuthCookie, `${path}: expected at least one Supabase auth cookie`).toBe(true);
    }
  });

  test("T-E2E-05: --list without CI shows only [setup, chromium]", async () => {
    // Run the list command without CI. We exec it as a child process because the
    // current Playwright runner has CI/CR/etc. set by the runner environment.
    const out = execSync("node_modules/.bin/playwright test --list", {
      encoding: "utf-8",
      env: { ...process.env, CI: "" },
    });
    const projectsInOutput = new Set<string>();
    for (const line of out.split("\n")) {
      const m = line.match(/^\s*\[(setup|chromium|Mobile Chrome)\]/);
      if (m) projectsInOutput.add(m[1]);
    }
    expect(projectsInOutput.has("setup")).toBe(true);
    expect(projectsInOutput.has("chromium")).toBe(true);
    expect(projectsInOutput.has("Mobile Chrome")).toBe(false);
  });

  test("T-E2E-06: CI=1 --list shows [setup, chromium, Mobile Chrome]", async () => {
    const out = execSync("node_modules/.bin/playwright test --list", {
      encoding: "utf-8",
      env: { ...process.env, CI: "1" },
    });
    const projectsInOutput = new Set<string>();
    for (const line of out.split("\n")) {
      const m = line.match(/^\s*\[(setup|chromium|Mobile Chrome)\]/);
      if (m) projectsInOutput.add(m[1]);
    }
    expect(projectsInOutput.has("setup")).toBe(true);
    expect(projectsInOutput.has("chromium")).toBe(true);
    expect(projectsInOutput.has("Mobile Chrome")).toBe(true);
  });

});

test.describe("T-E2E-03: test.use({ storageState: ... }) does NOT visit /auth/login (couple path)", () => {
  test.use({ storageState: "playwright/.auth/couple.json" });

  test("couple storageState skips /auth/login", async ({ page }) => {
    // Track every URL the page visits
    const visitedUrls: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) visitedUrls.push(frame.url());
    });

    // Visit a couple-protected route
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // The page never visited /auth/login. If a regression introduced a re-auth step
    // (e.g. storageState expired, or a misguided auto-login), this assertion would
    // fail and the contract would be broken.
    const authLoginVisits = visitedUrls.filter((u) => u.includes("/auth/login"));
    expect(authLoginVisits, `unexpected /auth/login visits: ${authLoginVisits.join(", ")}`).toEqual([]);
  });
});

test.describe("T-E2E-04: test.use({ storageState: { cookies: [], origins: [] } }) DOES visit /auth/login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("fresh context bounces to /auth/login", async ({ page }) => {
    // Track navigation
    const visitedUrls: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) visitedUrls.push(frame.url());
    });

    // Try to access a protected route
    await page.goto("/dashboard");
    // The server-side auth guard should redirect to /auth/login
    await expect(page).toHaveURL(/\/auth\/login/);

    // We did visit /auth/login
    const authLoginVisits = visitedUrls.filter((u) => u.includes("/auth/login"));
    expect(authLoginVisits.length).toBeGreaterThanOrEqual(1);
  });
});
