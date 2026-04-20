import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  private readonly url = 'https://www.kriso.ee/';
  private readonly resultsTotal: Locator;
  private readonly addToCartLink: Locator;
  private readonly addToCartMessage: Locator;
  private readonly cartCount: Locator;
  private readonly backButton: Locator;
  private readonly forwardButton: Locator;
  private readonly noResultsMessage: Locator;
  private readonly pageBody: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.addToCartLink = this.page.getByRole('link', { name: /Lisa ostukorvi|Add to (cart|basket)/i });
    this.addToCartMessage = this.page.locator('.item-messagebox');
    this.cartCount = this.page.locator('.cart-products');
    this.backButton = this.page.locator('.cartbtn-event.back');
    this.forwardButton = this.page.locator('.cartbtn-event.forward');
    this.noResultsMessage = this.page.locator('.msg.msg-info');
    this.pageBody = this.page.locator('body');
  }

  async openUrl() {
    await this.page.goto(this.url);
  }

  async verifyResultsCountMoreThan(minCount: number) {
    const resultsText = await this.resultsTotal.textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(minCount);
  }

  async getResultsCount() {
    const resultsText = await this.resultsTotal.textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async addToCartByIndex(index: number) {
    await this.addToCartLink.nth(index).click();
  }

  async verifyAddToCartMessage() {
    await expect(this.addToCartMessage).toContainText(/Toode lisati ostukorvi|added to (the )?(cart|basket)/i);
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartCount).toContainText(expectedCount.toString());
  }

  async goBackFromCart() {
    await this.backButton.click();
  }

  async openShoppingCart() {
    await this.forwardButton.click();
    return new CartPage(this.page);
  }

  async verifyNoProductsFoundMessage() {
    await expect(this.noResultsMessage).toContainText(/ei leitud|did not find any match/i);
  }

  async verifyKeywordMentions(keyword: string, minMentions = 2) {
    const content = (await this.pageBody.innerText()).toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();
    const mentionCount = content.split(normalizedKeyword).length - 1;
    expect(mentionCount).toBeGreaterThanOrEqual(minMentions);
  }

  async verifyBookShown(title: string) {
    await expect(this.page.getByRole('link', { name: new RegExp(title, 'i') }).first()).toBeVisible();
  }

  async verifyIsbnShown(isbn: string) {
    await expect(this.page.getByText(new RegExp(isbn))).toBeVisible();
  }

  async openMusicBooksCategory() {
    await this.page.goto('https://www.kriso.ee/muusika-ja-noodid.html');
    return new ProductPage(this.page);
  }
}
