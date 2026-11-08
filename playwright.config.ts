import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 1,
  webServer: {
    command: process.env.LAB_PRODUCTION ? 'npm run preview' : 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI && !process.env.LAB_PRODUCTION,
    timeout: 30000,
  },
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    baseURL: 'http://localhost:5173',
    viewport: { width: 1600, height: 1100 },
  },
});
