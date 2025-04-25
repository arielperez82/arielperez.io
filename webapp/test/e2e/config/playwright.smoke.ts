import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.base';

export default defineConfig({
  ...baseConfig,
  testDir: '../tests/smoke',
  retries: 2,
  use: {
    ...baseConfig.use,
    baseURL: process.env.SMOKE_TEST_URL || 'https://your-production-url.vercel.app',
    // Add production-specific headers or authentication if needed
    extraHTTPHeaders: {
      'x-smoke-test': '1',
    },
  },
  // No webServer needed since we're testing against deployed environment
}); 