import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const parseMoney = (value: string | null) => Number((value || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;

const parseResultsCount = (value: string | null) => Number((value || '').replace(/\D/g, '')) || 0;

test.describe('Search for Books by Keywords', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://www.kriso.ee/');
    try {
      const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
      if (await consentButton.isVisible({ timeout: 5000 })) {
        await consentButton.click({ timeout: 5000 });
      }
    } catch {
      // Cookie banner is not always shown in CI environments.
    }
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('search scenarios', async () => {
    await expect(page.locator('.logo-icon')).toBeVisible();

    await page.locator('#top-search-text').fill('xqzwmfkj');
    await page.locator('#top-search-btn-wrap').click();
    await expect(page.locator('.msg.msg-info')).toContainText(/ei leitud|did not find any match/i);

    await page.locator('#top-search-text').fill('tolkien');
    await page.locator('#top-search-btn-wrap').click();

    const tolkienCount = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(tolkienCount).toBeGreaterThan(1);
    const pageText = (await page.locator('body').innerText()).toLowerCase();
    expect(pageText).toContain('tolkien');

    await page.locator('#top-search-text').fill('9780307588371');
    await page.locator('#top-search-btn-wrap').click();

    await expect(page.getByRole('link', { name: /gone girl/i }).first()).toBeVisible();
    await expect(page.getByText('9780307588371')).toBeVisible();
  });
});

test.describe('Add Books to Shopping Cart', () => {
  let page: Page;
  let basketSumOfTwo = 0;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://www.kriso.ee/');
    try {
      const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
      if (await consentButton.isVisible({ timeout: 5000 })) {
        await consentButton.click({ timeout: 5000 });
      }
    } catch {
      // Cookie banner is not always shown in CI environments.
    }
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('cart scenarios', async () => {
    await expect(page.locator('.logo-icon')).toBeVisible();

    await page.locator('#top-search-text').fill('harry potter');
    await page.locator('#top-search-btn-wrap').click();

    const resultsTotal = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(resultsTotal).toBeGreaterThan(1);

    await page.getByRole('link', { name: /Lisa ostukorvi|Add to (cart|basket)/i }).first().click();
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (the )?(cart|basket)/i);
    await expect(page.locator('.cart-products')).toContainText('1');

    await page.locator('.cartbtn-event.back').click();

    await page.getByRole('link', { name: /Lisa ostukorvi|Add to (cart|basket)/i }).nth(5).click();
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (the )?(cart|basket)/i);
    await expect(page.locator('.cart-products')).toContainText('2');

    await page.locator('.cartbtn-event.forward').click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('2');

    basketSumOfTwo = 0;
    const subtotalItems = await page.locator('.tbl-row > .subtotal').all();
    for (const item of subtotalItems) {
      basketSumOfTwo += parseMoney(await item.textContent());
    }

    const basketSumTotal = parseMoney(await page.locator('.order-total > .o-value').textContent());
    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);

    const firstItemName = ((await page.locator('.tbl-row .title a').first().textContent()) || '').trim();

    await page.locator('.icon-remove').first().click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('1');

    let basketSumOfOne = 0;
    const remainingSubtotalItems = await page.locator('.tbl-row > .subtotal').all();
    for (const item of remainingSubtotalItems) {
      basketSumOfOne += parseMoney(await item.textContent());
    }

    const basketSumTotalAfterRemoval = parseMoney(await page.locator('.order-total > .o-value').textContent());
    expect(basketSumTotalAfterRemoval).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);

    await expect(page.locator('.tbl-row .title a').filter({ hasNotText: firstItemName })).toHaveCount(1);
  });
});

test.describe('Navigate Products via Filters', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://www.kriso.ee/');
    try {
      const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
      if (await consentButton.isVisible({ timeout: 5000 })) {
        await consentButton.click({ timeout: 5000 });
      }
    } catch {
      // Cookie banner is not always shown in CI environments.
    }
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('filter scenarios', async () => {
    await expect(page.locator('.logo-icon')).toBeVisible();

    await page.goto('https://www.kriso.ee/muusika-ja-noodid.html');
    await expect(page).toHaveURL(/muusika|noodid|music/i);

    await page.getByRole('link', { name: /kitarr|guitar/i }).first().click();

    const guitarCount = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(guitarCount).toBeGreaterThan(1);
    await expect(page).toHaveURL(/kitarr|guitar|muusika/i);

    await page.getByRole('link', { name: /inglise|english/i }).first().click();
    const englishFilteredCount = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(englishFilteredCount).toBeLessThan(guitarCount);

    await page.getByRole('link', { name: /cd/i }).first().click();
    const cdFilteredCount = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(cdFilteredCount).toBeLessThanOrEqual(englishFilteredCount);
    await expect(page.locator('body')).toContainText(/cd/i);

    await page.goBack();
    await page.goBack();

    const afterRemovingFiltersCount = parseResultsCount(await page.locator('.sb-results-total').textContent());
    expect(afterRemovingFiltersCount).toBeGreaterThanOrEqual(cdFilteredCount);
  });
});