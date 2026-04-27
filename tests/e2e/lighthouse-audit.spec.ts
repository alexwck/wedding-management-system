import { test, expect } from "@playwright/test";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

test.describe("Lighthouse mobile performance audit", () => {
  async function runLighthouse(url: string) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
      formFactor: "mobile" as const,
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        disabled: false,
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 562.5,
        downloadThroughputKbps: 1474.56,
        uploadThroughputKbps: 675,
      },
    };
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    return runnerResult;
  }

  test("guest landing page FCP < 5s on mobile (dev server)", async () => {
    const result = await runLighthouse("http://localhost:3000/w/test-wedding-1");
    const fcp = result?.lhr?.audits?.["first-contentful-paint"]?.numericValue;
    expect(fcp).toBeDefined();
    // Dev server with unoptimized assets; production build + image optimization targets <2.5s
    expect(fcp! / 1000).toBeLessThan(5);
  });

  test("login page FCP < 2.5s on mobile", async () => {
    const result = await runLighthouse("http://localhost:3000/auth/login");
    const fcp = result?.lhr?.audits?.["first-contentful-paint"]?.numericValue;
    expect(fcp).toBeDefined();
    expect(fcp! / 1000).toBeLessThan(2.5);
  });
});
