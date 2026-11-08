import { test, expect, type Page } from '@playwright/test';
async function mode(page: Page, title: string, value: string) {
  await page
    .locator('.scenario')
    .filter({ has: page.locator('.scenario-heading strong').filter({ hasText: new RegExp(`^${title}$`) }) })
    .getByRole('button', { name: value, exact: true })
    .click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.watchlist-footer')).toContainText('2,200 results');
});
test('Search and watchlist repeat across modes and scroll positions', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search symbols' });
  for (const value of ['baseline', 'optimized', 'baseline', 'optimized']) {
    await mode(page, 'Watchlist', value === 'baseline' ? 'Baseline' : 'Optimized');
    await expect(page.locator('.instrument-row')).toHaveCount(value === 'baseline' ? 2200 : 17);
    await page.locator('.watchlist-scroll').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await mode(page, 'Search', value === 'baseline' ? 'Baseline' : 'Optimized');
    await input.fill('  NVDA  ');
    await expect(page.locator('.watchlist-footer')).toContainText('1 results');
    await expect(page.locator('.instrument-row')).toHaveCount(1);
    await expect(page.locator('.instrument-row').first()).toBeVisible();
    await input.fill('');
    await expect(page.locator('.watchlist-footer')).toContainText('2,200 results');
  }
});
test('Order book retains matching geometry after repeated switches', async ({ page }) => {
  const widths: number[] = [];
  for (const value of ['Baseline', 'Optimized', 'Baseline', 'Optimized']) {
    await mode(page, 'Order book', value);
    await page.waitForTimeout(800);
    widths.push(
      await page
        .locator('.depth-bar.green')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width),
    );
    await expect(page.locator('[data-depth-row]')).toHaveCount(160);
  }
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
});
test('Bulletin reserves stable space in Optimized and replays in both modes', async ({ page }) => {
  for (const value of ['Baseline', 'Optimized']) {
    await mode(page, 'Market bulletin', value);
    await page.getByRole('button', { name: 'Replay bulletin' }).click();
    await expect(page.locator('.market-bulletin')).toHaveCount(0);
    const before = await page.locator('.workspace').evaluate((el) => el.getBoundingClientRect().top);
    await expect(page.locator('.market-bulletin')).toBeVisible({ timeout: 5000 });
    const after = await page.locator('.workspace').evaluate((el) => el.getBoundingClientRect().top);
    const noticeHeight = await page.locator('.market-bulletin').evaluate((el) => el.getBoundingClientRect().height);
    if (value === 'Baseline') expect(after - before).toBeGreaterThanOrEqual(noticeHeight);
    else expect(after - before).toBe(0);
  }
});
test('Overview returns matching visible values and different recorded payloads', async ({ page }) => {
  const sizes: number[] = [];
  const times: number[] = [];
  const texts: string[] = [];
  for (const value of ['Baseline', 'Optimized']) {
    await mode(page, 'Market overview', value);
    await expect(page.locator('.overview-skeleton')).toHaveCount(0);
    const start = Date.now();
    const response = page.waitForResponse((r) => r.url().includes('/api/overview?'));
    await page.getByRole('button', { name: 'Reload overview' }).click();
    sizes.push((await (await response).body()).length);
    await expect(page.locator('.overview-skeleton')).toHaveCount(0);
    times.push(Date.now() - start);
    texts.push(await page.locator('.overview-items').innerText());
  }
  expect(texts[0]).toBe(texts[1]);
  expect(sizes[0]).toBeGreaterThan(sizes[1] * 100);
  expect(times[0]).toBeGreaterThan(1000);
});
test('Scanner moves within its track in each mode', async ({ page }) => {
  for (const value of ['Baseline', 'Optimized']) {
    await mode(page, 'Chart scanner', value);
    const positions: number[] = [];
    for (let n = 0; n < 4; n++) {
      await page.waitForTimeout(400);
      positions.push(
        await page.locator('.scanner-marker').evaluate((el) => {
          const r = el.getBoundingClientRect(),
            p = el.parentElement!.getBoundingClientRect();
          if (r.left < p.left || r.right > p.right + 1) throw Error('Marker outside track');
          return r.left;
        }),
      );
    }
    expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(10);
  }
});
