import { type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
    execSync('supabase start --ignore-health-check --exclude studio,storage-api,mailpit,supavisor,vector,postgrest,logflare,kong,imgproxy,realtime', { stdio: 'inherit' });
    process.env.TEST_SETUP_COMPLETE = 'true';
  }

export default globalSetup; 