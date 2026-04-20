import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { ProductPage } from '../pages/ProductPage';

test.describe.configure({ mode: 'serial' });

test.describe('Search for Books by Keywords (POM)', () => {
  let page: Page;
  let homePage: HomePage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    homePage = new HomePage(page);
    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('search scenarios with POM', async () => {
    await homePage.verifyLogo();

    await homePage.searchByKeyword('xqzwmfkj');
    await homePage.verifyNoProductsFoundMessage();

    await homePage.searchByKeyword('tolkien');
    await homePage.verifyResultsCountMoreThan(1);
    await homePage.verifyKeywordMentions('tolkien');

    await homePage.searchByKeyword('9780307588371');
    await homePage.verifyBookShown('Gone Girl');
    await homePage.verifyIsbnShown('9780307588371');
  });
});

test.describe('Add Books to Shopping Cart (POM)', () => {
  let page: Page;
  let homePage: HomePage;
  let cartPage: CartPage;
  let basketSumOfTwo = 0;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    homePage = new HomePage(page);
    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('cart scenarios with POM', async () => {
    await homePage.verifyLogo();

    await homePage.searchByKeyword('harry potter');
    await homePage.verifyResultsCountMoreThan(1);

    await homePage.addToCartByIndex(0);
    await homePage.verifyAddToCartMessage();
    await homePage.verifyCartCount(1);
    await homePage.goBackFromCart();

    await homePage.addToCartByIndex(5);
    await homePage.verifyAddToCartMessage();
    await homePage.verifyCartCount(2);

    cartPage = await homePage.openShoppingCart();
    await cartPage.verifyCartCount(2);
    basketSumOfTwo = await cartPage.verifyCartSumIsCorrect();

    await cartPage.removeItemByIndex(0);
    await cartPage.verifyCartCount(1);
    const basketSumOfOne = await cartPage.verifyCartSumIsCorrect();
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
  });
});

test.describe('Navigate Products via Filters (POM)', () => {
  let page: Page;
  let homePage: HomePage;
  let productPage: ProductPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    homePage = new HomePage(page);
    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('filter scenarios with POM', async () => {
    await homePage.verifyLogo();
    productPage = await homePage.openMusicBooksCategory();

    await productPage.openGuitarCategory();
    await productPage.verifyResultsCountMoreThan(1);
    const guitarCount = await productPage.getResultsCount();

    await productPage.applyEnglishLanguageFilter();
    const englishCount = await productPage.getResultsCount();
    expect(englishCount).toBeLessThan(guitarCount);

    await productPage.applyCdFormatFilter();
    const cdCount = await productPage.getResultsCount();
    expect(cdCount).toBeLessThanOrEqual(englishCount);
    await productPage.verifyActiveFiltersContain('CD');

    await productPage.removeFiltersByGoingBack(2);
    const removedFiltersCount = await productPage.getResultsCount();
    expect(removedFiltersCount).toBeGreaterThanOrEqual(cdCount);
  });
});