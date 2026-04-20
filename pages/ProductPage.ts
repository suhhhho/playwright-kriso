import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly resultsTotal: Locator;
  private readonly body: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.body = this.page.locator('body');
  }

  async openGuitarCategory() {
    await this.page.getByRole('link', { name: /kitarr/i }).first().click();
  }

  async applyEnglishLanguageFilter() {
    await this.page.getByRole('link', { name: /inglise|english/i }).first().click();
  }

  async applyCdFormatFilter() {
    await this.page.getByRole('link', { name: /cd/i }).first().click();
  }

  async getResultsCount() {
    const resultsText = await this.resultsTotal.textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsCountMoreThan(minCount: number) {
    expect(await this.getResultsCount()).toBeGreaterThan(minCount);
  }

  async verifyActiveFiltersContain(text: string) {
    await expect(this.body).toContainText(new RegExp(text, 'i'));
  }

  async removeFiltersByGoingBack(times = 2) {
    for (let i = 0; i < times; i += 1) {
      await this.page.goBack();
    }
  }
}
