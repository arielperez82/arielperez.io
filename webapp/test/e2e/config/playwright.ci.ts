import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.base';

export default defineConfig({
  ...baseConfig,
  retries: 2,
  workers: 1,
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
}); 