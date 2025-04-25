import { type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {

    // Example of setting environment variables for tests
    process.env.TEST_SETUP_COMPLETE = 'true';
}

export default globalSetup; 