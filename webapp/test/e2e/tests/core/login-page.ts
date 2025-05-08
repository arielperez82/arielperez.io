import { Page } from '@playwright/test';
import { DEFAULT_TEST_PASSWORD } from './auth-helpers';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  getEmailField() {
    return this.page.getByLabel('Email address');
  }

  async fillEmail(email: string) {
    await this.getEmailField().fill(email);
  }

  getPasswordField() {
    return this.page.getByLabel('Password', { exact: true });
  }

  async fillPassword(password: string) {
    await this.getPasswordField().fill(password);
  }

  getLoginButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }
  
  async submit() {
    await this.getLoginButton().click();
  }

  async login(email: string, password: string = DEFAULT_TEST_PASSWORD) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
} 