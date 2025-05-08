import { Page, Locator } from '@playwright/test';
import { DEFAULT_TEST_PASSWORD } from './auth-helpers';
export class RegistrationPage {
  constructor(private page: Page) {}

  goto() {
    return this.page.goto('/register');
  }

  getEmailField(): Locator {
    return this.page.getByLabel('Email address');
  }

  getPasswordField(): Locator {
    return this.page.getByLabel('Password', { exact: true });
  }

  getConfirmPasswordField(): Locator {
    return this.page.getByLabel('Confirm password');
  }

  getCreateAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Create account' });
  }

  getDuplicateUserError(): Locator {
    return this.page.getByText('User already registered');
  }

  async register(email: string, password: string = DEFAULT_TEST_PASSWORD) {
    await this.getEmailField().fill(email);
    await this.getPasswordField().fill(password);
    await this.getConfirmPasswordField().fill(password);
    await this.getCreateAccountButton().click();
  }
} 