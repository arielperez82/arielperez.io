import { test, expect } from '@playwright/test';
import { LoginPage } from './login-page';
import { generateUniqueEmail, loginViaApi, registerViaApi } from './auth-helpers';
import { RegistrationPage } from './registration-page';
import { SecurePage } from './secure-page';

test('user can register', async ({ page }) => {
  const uniqueEmail = generateUniqueEmail();
  const registrationPage = new RegistrationPage(page);
  await registrationPage.goto();
  await registrationPage.register(uniqueEmail);

  // Should redirect to login page with registered=true query param
  await expect(page).toHaveURL(/\/login\?registered=true/);
});

test.describe('given user is registered', () => {
  let email: string;

  test.beforeEach(async ({ page }) => {
    email = generateUniqueEmail();
    await registerViaApi(page, email);
  });

  test('they cannot re-register', async ({ page }) => {   
    // Attemp to re-register first
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.register(email);

    await expect(registrationPage.getDuplicateUserError()).toBeVisible();
  });

  test('they can log in', async ({ page }) => {   
    // Log in
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email);
    
    const securePage = new SecurePage(page);
    await expect(securePage.getUserId()).toBeVisible();
    await expect(securePage.getLogoutButton()).toBeVisible();
  });

  test.describe('and user is logged in', () => {
    test.beforeEach(async ({ page }) => {
      await loginViaApi(page, email);
      await page.goto('/');
    });

    test('they can log out', async ({ page }) => {
      const securePage = new SecurePage(page);
      await securePage.logout();
      
      await expect(securePage.getLogoutButton()).toBeHidden();

      const loginPage = new LoginPage(page);
      await expect(loginPage.getLoginButton()).toBeVisible();
    });

    test("when they reload, they're still signed in", async ({ page }) => {
      await page.reload();

      // Use SecurePage for assertions
      const securePage = new SecurePage(page);
      await expect(securePage.getUserId()).toBeVisible();
      await expect(securePage.getLogoutButton()).toBeVisible();
    });
  });
});