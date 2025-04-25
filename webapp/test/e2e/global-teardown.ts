import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  
  // Add any other global teardown logic here
  // For example:
  // - Clean up test data
  // - Reset environment state
  // - Clean up authentication tokens
}

export default globalTeardown; 