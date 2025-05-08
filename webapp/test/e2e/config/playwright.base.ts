import { devices, type PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

// Read environment variables from process.env or .env files
const DEFAULT_BASE_URL = 'http://localhost:3000';

export const baseConfig: PlaywrightTestConfig = {
  timeout: 30 * 1000,
  testDir: '../tests',
  outputDir: path.join(__dirname, '../test-results'),
  fullyParallel: true,
  reporter: [['html']],
  use: {
    baseURL: DEFAULT_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome']
      }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  globalSetup: [
    require.resolve('../global-setup')
  ],
  globalTeardown: [
    require.resolve('../global-teardown'),
  ],
  testMatch: '**/*.spec.ts',
}; 