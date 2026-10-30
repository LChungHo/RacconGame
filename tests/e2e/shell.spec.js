import { test, expect } from '@playwright/test';
test('game_page_has_accessible_controls', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.locator('#game-canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: '시작', exact: true })).toBeVisible();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.getByText(/방향키/).first()).toBeVisible();
});
