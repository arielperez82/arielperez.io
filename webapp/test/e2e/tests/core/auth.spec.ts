import { test, expect } from '@playwright/test';

function generateUniqueEmail() {
  return `testuser_${Date.now() + Math.floor(Math.random() * 10000) + 1}@example.com`;
}

test('user can visit login page', async ({ page }) => {
  await page.goto('/login');
  
  // Verify login form elements are present
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('user can register a new account', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Email address').fill(uniqueEmail);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm password').fill('testpassword');
  await page.getByRole('button', { name: 'Create account' }).click();
  
  // Should redirect to login page
  await expect(page).toHaveURL(/\/login\?registered=true/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('user can log in and see authenticated UI', async ({ page }) => {
  const email = generateUniqueEmail();
  // Register first
  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm password').fill('testpassword');
  await page.getByRole('button', { name: 'Create account' }).click();
   
  // Sign in after redirection to login page
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Assert user email and sign out button are visible
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('user can log out and is redirected to login', async ({ page }) => {
  const email = generateUniqueEmail();
  // Register and log in first
  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm password').fill('testpassword');
  await page.getByRole('button', { name: 'Create account' }).click();
  
  // Sign in after redirection to login page
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();
    
  // Log out
  await page.getByRole('button', { name: 'Sign out' }).click();
  
  // Should redirect to login
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('session persists after reload', async ({ page }) => {
  const email = generateUniqueEmail();
  // Register and log in first
  await page.goto('/register');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByLabel('Confirm password').fill('testpassword');
  await page.getByRole('button', { name: 'Create account' }).click();
  
  // Sign in after redirection to login page
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('testpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Reload the page
  await page.reload();
  
  // Assert user email and sign out button are still visible
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
}); 