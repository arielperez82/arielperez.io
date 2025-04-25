import { test, expect } from '@playwright/test';

test('login is loading', async ({ request }) => {
  // Test health endpoint
  const healthResponse = await request.get('/login');
  expect(healthResponse.ok()).toBeTruthy();
}); 