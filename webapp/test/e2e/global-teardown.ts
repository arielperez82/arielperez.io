import { type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  execSync('pnpm supabase:stop', { stdio: 'inherit' });
}

export default globalTeardown; 