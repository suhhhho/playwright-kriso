/**
 * Part I — Flat tests (no POM)
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Search for Books by Keywords', () => {

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
  
      await page.goto('https://www.kriso.ee/');
      await page.getByRole('button', { name: 'Nõustun' }).click();
    });
  
    test.afterAll(async () => {
      await page.context().close();
    });

    test('Test logo is visible', async () => {
      await expect(page.locator('.logo-icon')).toBeVisible();
    });

  test('Test no products found', async () => {
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõna' }).fill('xqzwmfkj');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('.msg.msg-info')).toContainText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud');
  });

    test('Test search results contain keyword', async () => {
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõna' }).fill('tolkien');
    await page.getByRole('button', { name: 'Search' }).click();

    const resultsText = await page.locator('.sb-results-total').textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);

    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    expect(bodyText).toContain('tolkien');
  });

    test('Test search by ISBN', async () => {
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõna' }).fill('9780307588371');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('link', { name: /gone girl/i }).first()).toBeVisible();
    await expect(page.getByText('9780307588371')).toBeVisible();
  });

});
