import { type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
    execSync('pnpm supabase:start', { stdio: 'inherit' });
    process.env.TEST_SETUP_COMPLETE = 'true';
  }

export default globalSetup; 