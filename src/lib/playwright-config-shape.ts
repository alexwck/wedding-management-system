// Pure decision helpers for playwright.config.ts. Extracted so that the configuration
// shape can be unit-tested without a live @playwright/test import (vitest + jsdom only).
//
// The constants and function shapes here are the contract; the actual config file consumes
// them at module-eval time. The tests in tests/unit/lib/playwright-config-shape.test.ts
// pin the contract: isCI / isProd / buildProjects / buildWebServer / setupTestMatch.

export type WebServerConfig = {
  command: string;
  url: string;
  reuseExistingServer: boolean;
  timeout: number;
};

export type ProjectConfig = {
  name: string;
  testMatch?: RegExp;
  use?: Record<string, unknown>;
  dependencies?: string[];
};

export const SETUP_PROJECT_NAME = "setup";
export const CHROMIUM_PROJECT_NAME = "chromium";
export const MOBILE_PROJECT_NAME = "Mobile Chrome";
export const ADMIN_STORAGE_STATE = "playwright/.auth/admin.json";
export const COUPLE_STORAGE_STATE = "playwright/.auth/couple.json";

/** True when CI is set in the environment (any truthy value). */
export function isCI(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.CI;
}

/** True when PW_USE_PROD is set in the environment. */
export function isProd(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.PW_USE_PROD;
}

/** The regex that scopes the setup project to *.setup.ts files only. */
export const setupTestMatch = (): RegExp => /.*\.setup\.ts/;

/**
 * Build the projects array. The setup project is always first; chromium follows;
 * Mobile Chrome is included only when CI is set.
 */
export function buildProjects(env: NodeJS.ProcessEnv = process.env): ProjectConfig[] {
  const setupProject: ProjectConfig = {
    name: SETUP_PROJECT_NAME,
    testMatch: setupTestMatch(),
  };
  const baseProjects: ProjectConfig[] = [
    {
      name: CHROMIUM_PROJECT_NAME,
      use: { storageState: ADMIN_STORAGE_STATE },
      dependencies: [SETUP_PROJECT_NAME],
    },
  ];
  const projects = isCI(env)
    ? [
        ...baseProjects,
        {
          name: MOBILE_PROJECT_NAME,
          use: { storageState: COUPLE_STORAGE_STATE },
          dependencies: [SETUP_PROJECT_NAME],
        },
      ]
    : baseProjects;
  return [setupProject, ...projects];
}

/**
 * Build the webServer block. In prod mode, the bash one-liner rebuilds only when
 * .next/BUILD_ID is missing or older than package.json; otherwise it starts the server.
 */
export function buildWebServer(
  env: NodeJS.ProcessEnv = process.env
): WebServerConfig {
  if (isProd(env)) {
    return {
      command:
        "bash -c 'if [ ! -f .next/BUILD_ID ] || [ .next/BUILD_ID -ot package.json ]; then npm run build; fi && npm run start'",
      url: "http://localhost:3000",
      reuseExistingServer: !isCI(env),
      timeout: 240_000,
    };
  }
  return {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI(env),
    timeout: 120_000,
  };
}

/**
 * Build the top-level config flags (forbidOnly + retries) that flip on when CI is set.
 * Pinned as a helper so the unit test can verify the contract without re-running the config.
 */
export function buildCiFlags(env: NodeJS.ProcessEnv = process.env): {
  forbidOnly: boolean;
  retries: number;
} {
  const ci = isCI(env);
  return { forbidOnly: ci, retries: ci ? 2 : 0 };
}
