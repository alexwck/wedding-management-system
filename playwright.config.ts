import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const isProd = !!process.env.PW_USE_PROD;

// `setup` project signs in once per run via tests/e2e/auth.setup.ts and writes
// storageState JSONs under playwright/.auth/. The two browser projects below
// depend on it so it always runs first; see plan §D-1.
const setupProject = {
  name: "setup",
  testMatch: /.*\.setup\.ts/,
};

const baseProjects = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "playwright/.auth/admin.json",
    },
    dependencies: ["setup"],
  },
];

// Mobile Chrome is local-only opt-in: CI gets both projects, local default skips it.
// Spec FR-002 + research §R-4: chromium=admin, mobile=couple. Specs that need the
// non-default role opt in per file with `test.use({ storageState: "..." })`.
const projects = isCI
  ? [
      ...baseProjects,
      {
        name: "Mobile Chrome",
        use: {
          ...devices["Pixel 5"],
          storageState: "playwright/.auth/couple.json",
        },
        dependencies: ["setup"],
      },
    ]
  : baseProjects;

// In prod mode, prefer a webpack-built server. The build runs only if the existing
// .next/BUILD_ID is missing or older than package.json; otherwise reuse the artifact.
// AGENTS.md gotcha: production builds use --webpack.
const webServer = isProd
  ? {
      command:
        'bash -c \'if [ ! -f .next/BUILD_ID ] || [ .next/BUILD_ID -ot package.json ]; then npm run build; fi && npm run start\'',
      url: "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: 240_000,
    }
  : {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: 120_000,
    };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  fullyParallel: false,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: "html",
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [setupProject, ...projects],
  webServer,
});
