import { describe, it, expect } from "vitest";
import {
  isCI,
  isProd,
  setupTestMatch,
  buildProjects,
  buildWebServer,
  buildCiFlags,
  SETUP_PROJECT_NAME,
  CHROMIUM_PROJECT_NAME,
  MOBILE_PROJECT_NAME,
  ADMIN_STORAGE_STATE,
  COUPLE_STORAGE_STATE,
} from "@/lib/playwright-config-shape";

// Helper: a fresh process.env stub. The shape helpers take env as a parameter so they can
// be tested without mutating the test runner's actual env.
function makeEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return { ...overrides };
}

describe("isCI", () => {
  it("returns false when CI is unset", () => {
    expect(isCI(makeEnv({}))).toBe(false);
  });

  it("returns true when CI is set to any truthy value", () => {
    expect(isCI(makeEnv({ CI: "1" }))).toBe(true);
    expect(isCI(makeEnv({ CI: "true" }))).toBe(true);
    expect(isCI(makeEnv({ CI: "anything" }))).toBe(true);
  });
});

describe("isProd", () => {
  it("returns false when PW_USE_PROD is unset", () => {
    expect(isProd(makeEnv({}))).toBe(false);
  });

  it("returns true when PW_USE_PROD is set", () => {
    expect(isProd(makeEnv({ PW_USE_PROD: "1" }))).toBe(true);
  });
});

describe("setupTestMatch", () => {
  it("matches files containing the substring .setup.ts", () => {
    // The regex /.*\.setup\.ts/ is a raw regex (NOT a Playwright glob). It matches any
    // string that contains the literal substring ".setup.ts". This is a known quirk: a
    // file like "auth.setup.tsx" would also match because ".setup.ts" is a prefix of
    // "auth.setup.tsx" (".setup.ts" + "x"). In practice only auth.setup.ts exists, so the
    // false positive is harmless. The test pins the actual behavior.
    const re = setupTestMatch();
    expect(re.test("auth.setup.ts")).toBe(true);
    expect(re.test("nested/auth.setup.ts")).toBe(true);
    expect(re.test("admin.setup.ts.spec.ts")).toBe(true);
    expect(re.test("setup.ts")).toBe(false); // requires a leading ".", so plain "setup.ts" doesn't match
    expect(re.test("foo.setup.tsbar")).toBe(true); // substring match - .setup.ts inside the string
  });
});

describe("buildProjects", () => {
  it("returns [setup, chromium] when CI is unset", () => {
    const projects = buildProjects(makeEnv({}));
    expect(projects).toHaveLength(2);
    expect(projects[0].name).toBe(SETUP_PROJECT_NAME);
    expect(projects[0].testMatch).toBeDefined();
    expect(projects[1].name).toBe(CHROMIUM_PROJECT_NAME);
    expect(projects[1].dependencies).toEqual([SETUP_PROJECT_NAME]);
  });

  it("appends Mobile Chrome when CI is set", () => {
    const projects = buildProjects(makeEnv({ CI: "1" }));
    expect(projects).toHaveLength(3);
    expect(projects[2].name).toBe(MOBILE_PROJECT_NAME);
    expect(projects[2].dependencies).toEqual([SETUP_PROJECT_NAME]);
  });

  it("uses admin storageState for chromium and couple for Mobile Chrome", () => {
    const projects = buildProjects(makeEnv({ CI: "1" }));
    const chromium = projects.find((p) => p.name === CHROMIUM_PROJECT_NAME);
    const mobile = projects.find((p) => p.name === MOBILE_PROJECT_NAME);
    expect((chromium?.use as { storageState: string }).storageState).toBe(ADMIN_STORAGE_STATE);
    expect((mobile?.use as { storageState: string }).storageState).toBe(COUPLE_STORAGE_STATE);
  });
});

describe("buildWebServer", () => {
  it("uses npm run dev when PW_USE_PROD is unset", () => {
    const ws = buildWebServer(makeEnv({}));
    expect(ws.command).toBe("npm run dev");
    expect(ws.timeout).toBe(120_000);
  });

  it("uses the build-reuse bash one-liner when PW_USE_PROD is set", () => {
    const ws = buildWebServer(makeEnv({ PW_USE_PROD: "1" }));
    expect(ws.command).toContain("npm run build");
    expect(ws.command).toContain("npm run start");
    expect(ws.command).toContain(".next/BUILD_ID");
    expect(ws.command).toContain("-ot package.json");
    expect(ws.timeout).toBe(240_000);
  });

  it("sets reuseExistingServer based on CI (false in CI, true locally)", () => {
    expect(buildWebServer(makeEnv({})).reuseExistingServer).toBe(true);
    expect(buildWebServer(makeEnv({ CI: "1" })).reuseExistingServer).toBe(false);
    expect(buildWebServer(makeEnv({ PW_USE_PROD: "1" })).reuseExistingServer).toBe(true);
    expect(buildWebServer(makeEnv({ PW_USE_PROD: "1", CI: "1" })).reuseExistingServer).toBe(false);
  });
});

describe("buildCiFlags", () => {
  it("forbidOnly=false, retries=0 when CI is unset", () => {
    expect(buildCiFlags(makeEnv({}))).toEqual({ forbidOnly: false, retries: 0 });
  });

  it("forbidOnly=true, retries=2 when CI is set", () => {
    expect(buildCiFlags(makeEnv({ CI: "1" }))).toEqual({ forbidOnly: true, retries: 2 });
  });
});
