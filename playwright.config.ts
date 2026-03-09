import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000/",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
