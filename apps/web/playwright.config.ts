import { defineConfig, devices } from '@playwright/test';

// E2E runs against a local preview server (vite preview) unless E2E_BASE_URL is set.
const BASE = process.env.E2E_BASE_URL || 'http://localhost:4173/gym-tracker-app/';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  // When no external base URL is given, build + preview locally.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173',
        url: BASE,
        timeout: 120_000,
        reuseExistingServer: true,
      },
});
