import { expect, test } from '@playwright/test';

/**
 * Smoke tests — no auth, no Firebase, no Stripe. These prove the built
 * Next.js app boots and the highest-traffic public surfaces render.
 */

test.describe('public smoke', () => {
  test('homepage renders without server error', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    // The marketing homepage should render some recognisable QuickTrade copy.
    await expect(page).toHaveTitle(/quicktrade/i);
  });

  test('sign-in page is reachable', async ({ page }) => {
    const response = await page.goto('/auth/login');
    expect(response?.ok()).toBeTruthy();
    // Either an email field or a provider button should be visible.
    const hasSignInForm =
      (await page.getByRole('textbox', { name: /email/i }).count()) > 0 ||
      (await page.getByRole('button', { name: /sign in|continue|log in/i }).count()) > 0;
    expect(hasSignInForm).toBeTruthy();
  });
});
