import { test, expect } from '@playwright/test';

test('user can visit login page', async ({ page }) => {
  await page.goto('/login');
  
  // Verify login form elements are present
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
}); 