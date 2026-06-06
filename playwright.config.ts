import { defineConfig, devices } from "@playwright/test";
import {
  buildCiFlags,
  buildProjects,
  buildWebServer,
  isCI,
  isProd,
  ADMIN_STORAGE_STATE,
  COUPLE_STORAGE_STATE,
  CHROMIUM_PROJECT_NAME,
  MOBILE_PROJECT_NAME,
  SETUP_PROJECT_NAME,
} from "./src/lib/playwright-config-shape";

void isCI; // referenced via buildCiFlags / buildProjects / buildWebServer
void isProd; // same

// `setup` project signs in once per run via tests/e2e/auth.setup.ts and writes
// storageState JSONs under playwright/.auth/. The two browser projects below
// depend on it so it always runs first.
const projects = buildProjects();

// Per-project defaults: chromium=admin, mobile=couple. Specs that need the non-default
// role opt in per file with `test.use({ storageState: "..." })`.
for (const project of projects) {
  if (project.name === CHROMIUM_PROJECT_NAME) {
    project.use = {
      ...devices["Desktop Chrome"],
      storageState: ADMIN_STORAGE_STATE,
    };
  } else if (project.name === MOBILE_PROJECT_NAME) {
    project.use = {
      ...devices["Pixel 5"],
      storageState: COUPLE_STORAGE_STATE,
    };
  } else if (project.name === SETUP_PROJECT_NAME) {
    // testMatch is set by buildProjects; no use block needed
  }
}

// In prod mode, prefer a webpack-built server. The build runs only if the existing
// .next/BUILD_ID is missing or older than package.json; otherwise reuse the artifact.
// AGENTS.md gotcha: production builds use --webpack.
const webServer = buildWebServer();

const { forbidOnly, retries } = buildCiFlags();

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  fullyParallel: false,
  forbidOnly,
  retries,
  workers: 1,
  reporter: "html",
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects,
  webServer,
});
