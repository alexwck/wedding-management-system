import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // 1. Global timeout: Increase to 2-3 mins for AI reasoning + execution
  timeout: 180_000, 
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep at 1 to prevent request queuing
  reporter: "html",
  
  expect: {
    // 2. Increase assertion timeout (default is 5s)
    timeout: 10_000, 
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // 3. Action timeout: Give the cloud model more time to interact
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Note: Running multiple projects doubles the total time. 
    // Consider commenting out Mobile while debugging timeouts.
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // 4. Increase startup timeout for dev server
    timeout: 120_000, 
  },
});
