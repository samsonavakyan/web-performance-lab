import { test, expect, type Page } from '@playwright/test';

async function checkChart(page: Page) {
  const result = await page.locator('.candle-svg').evaluate((svg) => {
    const bounds = svg.getBoundingClientRect();
    const marker = svg.querySelector('.last-price-marker rect')!.getBoundingClientRect();
    const text = svg.querySelector('.last-price')!.getBoundingClientRect();
    const overlaps = [...svg.querySelectorAll('.price-axis-label')]
      .filter((label) => {
        const r = label.getBoundingClientRect();
        return r.left < marker.right && r.right > marker.left && r.top < marker.bottom && r.bottom > marker.top;
      })
      .map((label) => label.textContent);
    return {
      overlaps,
      textFits:
        text.left >= marker.left - 1 &&
        text.right <= marker.right + 1 &&
        text.top >= marker.top - 1 &&
        text.bottom <= marker.bottom + 1,
      markerFits: marker.left >= bounds.left && marker.right <= bounds.right + 1,
      overflow: document.documentElement.scrollWidth > innerWidth,
      labelFont:
        Number.parseFloat(getComputedStyle(svg.querySelector('.price-axis-label')!).fontSize) * svg.getScreenCTM()!.a,
    };
  });
  expect(result.overlaps).toEqual([]);
  expect(result.textFits).toBe(true);
  expect(result.markerFits).toBe(true);
  expect(result.overflow).toBe(false);
  expect(result.labelFont).toBeGreaterThanOrEqual(11);
  const statsFit = await page.locator('.chart-bottom').evaluate((root) => {
    const outer = root.getBoundingClientRect();
    return [...root.querySelectorAll('span,strong')].every((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= outer.left && r.right <= outer.right + 1;
    });
  });
  expect(statsFit).toBe(true);
}

for (const largePrice of [false, true]) {
  test(`Chart labels and stats fit across desktop sizes with ${largePrice ? 'large' : 'regular'} prices`, async ({
    page,
  }) => {
    if (largePrice) {
      await page.route('**/api/history/*', (route) =>
        route.fulfill({
          json: Array.from({ length: 24 }, (_, i) => {
            const close = 1234567.89 + (i - 23) * 2000;
            return { time: i, open: close - 400, close, high: close + 800, low: close - 1000, volume: 1000000 };
          }),
        }),
      );
    }
    await page.goto('/');
    await expect(page.locator('.last-price-marker')).toBeVisible();
    for (const labOpen of [true, false]) {
      if (!labOpen) await page.getByRole('button', { name: 'Performance Lab', exact: true }).click();
      for (const width of [1100, 1280, 1440, 1520, 1521, 1600, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );
        await checkChart(page);
      }
    }
  });
}

test('Sidebar controls and actions stay separated and aligned', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/');
  const overview = page.locator('[data-scenario="loading"]');
  await overview.scrollIntoViewIfNeeded();
  const layout = await overview.evaluate((root) => {
    const bounds = root.getBoundingClientRect();
    const select = root.querySelector('select')!.getBoundingClientRect();
    const actions = [...root.querySelectorAll('.scenario-actions button')].map((el) => el.getBoundingClientRect());
    return {
      selectFits: select.left >= bounds.left && select.right <= bounds.right,
      equalHeight: Math.abs(actions[0].height - actions[1].height) < 1,
      separated: actions[1].left - actions[0].right >= 7,
      actionsFit: actions.every((r) => r.left >= bounds.left && r.right <= bounds.right),
    };
  });
  expect(layout).toEqual({ selectFits: true, equalHeight: true, separated: true, actionsFit: true });
});
