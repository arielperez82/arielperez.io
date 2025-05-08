import { Page, Locator } from '@playwright/test';

export class SecurePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  getLogoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign out' });
  }

  getUserId(): Locator {
    return this.page.getByTitle('userId');
  }

  async logout() {
    await this.getLogoutButton().click();
  }
} 