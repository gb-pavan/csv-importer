import { expect, test } from '@playwright/test';

test('uploads, previews, and imports a CSV', async ({ page }) => {
  await page.route('**/api/upload', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        totalImported: 1,
        totalSkipped: 0,
        batchesProcessed: 1,
        successfullyParsed: [{ created_at: '2026-07-18T12:22:00', name: 'Jane Doe', email: 'jane@example.com' }],
        skippedRecords: [],
      }),
    });
  });
  await page.goto('/');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'leads.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,email\nJane Doe,jane@example.com'),
  });

  await expect(page.getByText('CSV Data Preview')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm & Extract with AI' }).click();
  await expect(page.getByText('Successfully Imported')).toBeVisible();
  await expect(page.getByText('18-07-2026 12:22 PM')).toBeVisible();
});
