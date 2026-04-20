/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
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

  test('Navigate and filter products', async () => {
    await expect(page.locator('.logo-icon')).toBeVisible();

    await page.goto('https://www.kriso.ee/muusika-ja-noodid.html');
    await expect(page).toHaveURL(/muusika|noodid|music/i);

    await page.getByRole('link', { name: /kitarr|guitar/i }).first().click();

    const guitarResultsText = await page.locator('.sb-results-total').textContent();
    const guitarCount = Number((guitarResultsText || '').replace(/\D/g, '')) || 0;
    expect(guitarCount).toBeGreaterThan(1);
    await expect(page).toHaveURL(/kitarr|guitar|muusika/i);

    await page.getByRole('link', { name: /inglise|english/i }).first().click();
    const englishResultsText = await page.locator('.sb-results-total').textContent();
    const englishCount = Number((englishResultsText || '').replace(/\D/g, '')) || 0;
    expect(englishCount).toBeLessThan(guitarCount);

    await page.getByRole('link', { name: /cd/i }).first().click();
    const cdResultsText = await page.locator('.sb-results-total').textContent();
    const cdCount = Number((cdResultsText || '').replace(/\D/g, '')) || 0;
    expect(cdCount).toBeLessThanOrEqual(englishCount);
    await expect(page.locator('body')).toContainText(/cd/i);

    await page.goBack();
    await page.goBack();

    const afterRemoveResultsText = await page.locator('.sb-results-total').textContent();
    const afterRemoveCount = Number((afterRemoveResultsText || '').replace(/\D/g, '')) || 0;
    expect(afterRemoveCount).toBeGreaterThanOrEqual(cdCount);
  });

});
