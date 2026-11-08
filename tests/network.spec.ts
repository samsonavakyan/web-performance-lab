import { test, expect, type Page } from '@playwright/test';

async function setMode(page: Page, mode: 'Baseline' | 'Optimized') {
  await page.locator('[data-scenario="loading"]').getByRole('button', { name: mode, exact: true }).click();
}

async function expectLoaded(page: Page) {
  await expect(page.locator('.overview-title [role="status"]')).toHaveText('Market pulse');
  await expect(page.locator('.overview-item')).toHaveCount(4);
  await expect(page.locator('.overview-skeleton')).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expectLoaded(page);
});

for (const mode of ['Baseline', 'Optimized'] as const) {
  test(`Overview handles HTTP errors, invalid data and recovery in ${mode}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await setMode(page, mode);
    await expectLoaded(page);

    const failure = page.waitForResponse((response) => response.url().includes('response=unavailable'));
    await page.getByLabel('Overview response').selectOption('unavailable');
    const failedResponse = await failure;
    expect(failedResponse.status()).toBe(500);
    expect(failedResponse.headers()['cache-control']).toBe('no-store');
    await expect(page.locator('.overview-title [role="status"]')).toHaveText('Overview unavailable');
    await expect(page.locator('.overview-title small')).toContainText('500');
    await expect(page.locator('.overview-skeleton')).toHaveCount(0);
    await expect(page.locator('.overview-item')).toHaveCount(0);

    await page.getByLabel('Overview response').selectOption('normal');
    await expectLoaded(page);
    const values = await page.locator('.overview-items').innerText();

    const invalid = page.waitForResponse((response) => response.url().includes('response=invalid'));
    await page.getByLabel('Overview response').selectOption('invalid');
    expect((await invalid).status()).toBe(200);
    await expect(page.locator('.overview-title [role="status"]')).toHaveText('Overview unavailable');
    await expect(page.locator('.overview-title small')).toHaveText('Unexpected response');
    await expect(page.locator('.overview-item')).toHaveCount(0);
    await expect(page.locator('.overview-skeleton')).toHaveCount(0);

    await page.getByLabel('Overview response').selectOption('normal');
    await expectLoaded(page);
    await expect(page.locator('.overview-items')).toHaveText(values, { useInnerText: true });
    expect(errors).toEqual([]);
  });
}

test('Overview recovers after a network failure and a malformed JSON response', async ({ page }) => {
  const overview = page.locator('[data-scenario="loading"]');
  await page.route('**/api/overview?*', (route) => route.abort('failed'));
  await overview.getByRole('button', { name: 'Reload overview', exact: true }).click();
  await expect(page.locator('.overview-title [role="status"]')).toHaveText('Overview unavailable');
  await expect(page.locator('.overview-skeleton')).toHaveCount(0);
  await page.unroute('**/api/overview?*');
  await overview.getByRole('button', { name: 'Reload overview', exact: true }).click();
  await expectLoaded(page);

  await page.route('**/api/overview?*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"title":',
    }),
  );
  await overview.getByRole('button', { name: 'Reload overview', exact: true }).click();
  await expect(page.locator('.overview-title [role="status"]')).toHaveText('Overview unavailable');
  await expect(page.locator('.overview-title small')).toHaveText('Unexpected response');
  await page.unroute('**/api/overview?*');
  await overview.getByRole('button', { name: 'Reload overview', exact: true }).click();
  await expectLoaded(page);
});

for (const lateStatus of [200, 500]) {
  test(`Overview ignores a late ${lateStatus} result after switching mode`, async ({ page }) => {
    await page.addInitScript(
      ({ status }) => {
        const fetchRequest = window.fetch.bind(window);
        window.fetch = (input, init) => {
          const url = new URL(input instanceof Request ? input.url : String(input), location.href);
          if (url.pathname === '/api/overview' && url.searchParams.get('mode') === 'baseline') {
            return new Promise<Response>((resolve) => {
              setTimeout(
                () =>
                  resolve(
                    new Response(
                      JSON.stringify({
                        asOf: '2026-01-02T15:30:00Z',
                        title: 'Previous overview',
                        highlights: [{ symbol: 'OLD', price: 1, change: 0 }],
                        extras: [],
                      }),
                      { status, headers: { 'Content-Type': 'application/json' } },
                    ),
                  ),
                900,
              );
            });
          }
          return fetchRequest(input, init);
        };
      },
      { status: lateStatus },
    );
    await page.reload();
    await expectLoaded(page);
    await setMode(page, 'Baseline');
    await expect(page.locator('.overview-title [role="status"]')).toHaveText('Loading market pulse…');
    await setMode(page, 'Optimized');
    await expectLoaded(page);
    await page.waitForTimeout(1100);
    await expectLoaded(page);
    await expect(page.locator('.overview-items')).not.toContainText('OLD');
    await expect(page.locator('.overview-title small')).not.toContainText('500');
  });
}
