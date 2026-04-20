import { test, expect } from '@playwright/test';

async function loginAsVerificationUser(page: import('@playwright/test').Page) {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'DDP' })).toBeVisible();
  await page.getByLabel('Username').fill('verification-user');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test('root route redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('competition report to event registration navigation and back behavior', async ({ page }) => {
  await loginAsVerificationUser(page);

  await page.goto('/student/activity/verification-panel');
  await expect(page.getByRole('heading', { name: 'Verification Panel' })).toBeVisible();

  const eventCards = page.locator('article[role="button"]');
  const eventCount = await eventCards.count();

  if (eventCount > 0) {
    await eventCards.first().click();
    await expect(page.getByText('Event Registrations')).toBeVisible();

    await page.getByRole('link', { name: 'Competition Reports' }).click();
  } else {
    await page.goto('/student/activity/verification-panel/competition-reports');
  }

  await expect(page.getByRole('heading', { name: 'Verification Panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Competition Reports' })).toBeVisible();

  await page.getByRole('button', { name: 'Event Registrations' }).click();
  await expect(page).toHaveURL(/\/student\/activity\/verification-panel/);
  await expect(page.getByRole('heading', { name: 'Verification Panel' })).toBeVisible();

  const noDataMessage = page.getByText('No registrations found');
  const cardCountAfterNav = await page.locator('article[role="button"]').count();
  if (cardCountAfterNav === 0) {
    await expect(noDataMessage).toBeVisible();
  } else {
    await expect(page.locator('article[role="button"]').first()).toBeVisible();
  }

  await page.goBack();
  await expect(page).toHaveURL(/competition-reports/);
  await expect(page.getByRole('heading', { name: 'Competition Reports' })).toBeVisible();
});
