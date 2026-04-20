import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly logo: Locator;
  protected readonly consentButton: Locator;
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;

  constructor(protected page: Page) {
    this.logo = this.page.locator('.logo-icon');
    this.consentButton = this.page.getByRole('button', { name: 'Nõustun' });
    this.searchInput = this.page.locator('#top-search-text');
    this.searchButton = this.page.locator('#top-search-btn-wrap');
  }

  async acceptCookies() {
    try {
      const visible = await this.consentButton.isVisible({ timeout: 5000 });
      if (visible) {
        await this.consentButton.click({ timeout: 5000 });
      }
    } catch {
      // Cookie banner is not always shown in CI environments.
    }
  }

  async verifyLogo() {
    await expect(this.logo).toBeVisible();
  }

  async searchByKeyword(keyword: string) {
    await this.searchInput.click();
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }
}
