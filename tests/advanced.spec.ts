import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, id: string, mode: 'Baseline' | 'Optimized') {
  await page.getByRole('tab', { name: /Advanced/ }).click();
  const scenario = page.locator(`[data-scenario="${id}"]`);
  await scenario.getByRole('button', { name: mode, exact: true }).click();
  await scenario.getByRole('button', { name: 'Open case' }).click();
  await expect(page.getByRole('region', { name: 'Advanced Lab' })).toBeVisible();
}
const metric = (page: Page, label: string) =>
  page.locator('.metric').filter({ has: page.getByText(label, { exact: true }) }).locator('strong');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Instrument monitor counters after switching instruments', async ({ page }) => {
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await page.reload();
    await open(page, 'leak', mode);
    const select = page.getByRole('combobox', { name: 'Instrument' });
    await expect(select.locator('option')).toHaveCount(150);
    for (const value of ['1', '2', '3', '4', '5']) {
      await select.selectOption(value);
      await expect(page.locator('canvas')).toHaveCount(1);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1200);
    const charts = Number(await metric(page, 'Live charts').innerText());
    const listeners = Number(await metric(page, 'Feed listeners').innerText());
    if (mode === 'Baseline') {
      expect(charts).toBeGreaterThanOrEqual(6);
      expect(listeners).toBeGreaterThanOrEqual(6);
    } else {
      expect(charts).toBe(1);
      expect(listeners).toBe(1);
    }
  }
});

test('Order ticket accepts input while the stream runs', async ({ page }) => {
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'stream', mode);
    await expect(page.locator('.quote-cell')).toHaveCount(1600);
    await page.getByRole('button', { name: 'Start stream' }).click();
    await page.waitForTimeout(1000);
    const price = page.getByRole('textbox', { name: 'Limit price' });
    await price.pressSequentially('143.25', { delay: 30 });
    await expect(price).toHaveValue('143.25');
    await expect(page.getByText('Notional: 14,325.00')).toBeVisible();
    console.log(mode, 'worst interaction', await metric(page, 'Worst interaction').innerText());
    await page.getByRole('button', { name: 'Stop stream' }).click();
  }
});

test('Instrument switch completes navigation in each mode', async ({ page }) => {
  const times: Record<string, number> = {};
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'navigation', mode);
    await expect(page.getByRole('status')).toHaveText('Ready');
    await page.getByRole('button', { name: 'AAPL' }).click();
    await expect(page.getByRole('status')).toHaveText('Ready');
    await expect(page.locator('.nav-header h2')).toHaveText('AAPL');
    await expect(page.locator('.nav-news li')).toHaveCount(4);
    times[mode] = parseInt(await metric(page, 'Page complete').innerText());
  }
  console.log('navigation', times);
  expect(times.Baseline).toBeGreaterThan(850);
  expect(times.Optimized).toBeLessThan(750);
});

test('Trade export produces the same file in each mode', async ({ page }) => {
  const results: Record<string, { file: string; block: number }> = {};
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'export', mode);
    await page.getByRole('combobox', { name: 'Trades' }).selectOption('50000');
    await page.getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect(page.getByRole('status')).toHaveText('Ready', { timeout: 40000 });
    results[mode] = {
      file: await metric(page, 'File').innerText(),
      block: parseInt(await metric(page, 'Longest main-thread block').innerText()),
    };
  }
  console.log('export', results);
  expect(results.Baseline.file).toBe(results.Optimized.file);
  expect(results.Baseline.file).toContain('50,000 rows');
  expect(results.Baseline.block).toBeGreaterThan(results.Optimized.block * 3);
});

test('Live feed status through sleep, wake and restart', async ({ page }) => {
  test.setTimeout(60000);
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'reconnect', mode);
    await page.getByRole('checkbox').uncheck();
    const badge = page.locator('.feed-badge');
    await expect(badge).toHaveText(mode === 'Baseline' ? 'Connected' : 'Live', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Simulate sleep' }).click();
    await page.waitForTimeout(4500);
    if (mode === 'Baseline') await expect(badge).toHaveText('Connected');
    else await expect(badge).toHaveText('Live');
    await page.getByRole('button', { name: 'Wake up' }).click();
    await page.waitForTimeout(1000);
    const missed = Number(await metric(page, 'Missed messages').innerText());
    if (mode === 'Baseline') expect(missed).toBeGreaterThan(10);
    else expect(missed).toBe(0);
    await page.getByRole('button', { name: 'Restart server' }).click();
    await expect(badge).toHaveText(mode === 'Baseline' ? 'Connected' : 'Live', { timeout: 20000 });
  }
});
