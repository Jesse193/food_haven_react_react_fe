import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'accept' }).click();
  await page.getByPlaceholder('Email').fill('alice@example.com');
  await page.getByPlaceholder('Password').fill('S3cureP@ssword');
  await page.getByRole('button', { type: 'submit' }).click();

  await expect(page.getByText('Welcome')).toBeVisible();
});