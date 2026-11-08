import { test, expect, type Page } from '@playwright/test';
async function open(page: Page, id: string, mode = 'Optimized') {
  await page.getByRole('tab', { name: /Advanced/ }).click();
  const scenario = page.locator(`[data-scenario="${id}"]`);
  await scenario.getByRole('button', { name: mode, exact: true }).click();
  await scenario.getByRole('button', { name: 'Open case' }).click();
  await expect(page.getByRole('region', { name: 'Advanced Lab' })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
test('Query workspace produces equal results and exposes intermediate updates', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const results: string[] = [];
  for (const mode of ['Baseline', 'Optimized']) {
    await open(page, 'scheduling', mode);
    await page.getByLabel('Workload', { exact: true }).selectOption('240');
    await page.evaluate(() => {
      (window as any).pendingSeen = false;
      const observer = new MutationObserver(() => {
        if (document.querySelector('.advanced-lab [role="status"]')?.textContent === 'Updating results')
          (window as any).pendingSeen = true;
      });
      observer.observe(document.querySelector('.advanced-lab')!, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      (window as any).queryObserver = observer;
    });
    await page.getByRole('textbox', { name: 'Workspace query' }).pressSequentially('market', { delay: 10 });
    await expect(page.locator('.query-results')).toHaveAttribute('data-query', 'market');
    await expect(page.locator('.query-row')).toHaveCount(240);
    results.push(await page.locator('.query-results').innerText());
    const pending = await page.evaluate(() => {
      (window as any).queryObserver.disconnect();
      return (window as any).pendingSeen;
    });
    expect(pending).toBe(mode === 'Optimized');
    await page.getByRole('button', { name: 'Check interaction: 0' }).click();
    await expect(page.getByRole('button', { name: 'Check interaction: 1' })).toBeVisible();
  }
  expect(results[0]).toBe(results[1]);
});
test('Desk feed and appearance repeat with matching visible output', async ({ page }) => {
  const commits: number[] = [];
  const results: string[] = [];
  for (const mode of ['Baseline', 'Optimized']) {
    await open(page, 'context', mode);
    await expect(page.locator('.desk-card')).toHaveCount(48);
    const before = Number(await page.locator('.desk-card').first().getAttribute('data-commits'));
    await page.getByRole('button', { name: 'Run feed' }).click();
    await expect(page.getByLabel('Feed sequence')).toHaveText('20', { timeout: 15000 });
    commits.push(Number(await page.locator('.desk-card').first().getAttribute('data-commits')) - before);
    await page.getByRole('button', { name: 'Change appearance' }).click();
    await expect(page.locator('.desk-card.day')).toHaveCount(48);
    results.push(await page.locator('.desk-grid').innerText());
    await page.getByRole('button', { name: 'Run feed' }).click();
    await expect(page.getByLabel('Feed sequence')).toHaveText('40', { timeout: 15000 });
  }
  expect(results[0]).toBe(results[1]);
  expect(commits[0]).toBeGreaterThanOrEqual(20);
  expect(commits[1]).toBe(0);
  console.log('Desk card commits during 20 feed updates:', commits);
});
test('Portfolio reports match, accept notes during work and cancel safely', async ({ page }) => {
  const results: string[] = [];
  const inputTimes: number[] = [];
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const mode of ['Baseline', 'Optimized']) {
    await open(page, 'computation', mode);
    await page.getByLabel('Samples', { exact: true }).selectOption('4000000');
    await page.getByRole('button', { name: 'Run report', exact: true }).click();
    await page.waitForTimeout(80);
    const start = Date.now();
    await page.getByRole('textbox', { name: 'Report note' }).fill('Review');
    inputTimes.push(Date.now() - start);
    if (mode === 'Optimized') await expect(page.locator('.advanced-lab [role="status"]')).toHaveText('Running');
    await expect(page.locator('.report-result')).toBeVisible({ timeout: 20000 });
    results.push(await page.locator('.report-values').innerText());
  }
  expect(results[0]).toBe(results[1]);
  console.log('Report input wait ms, Baseline/Optimized:', inputTimes);
  await page.getByRole('button', { name: 'Run report', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel report' }).click();
  await expect(page.locator('.advanced-lab [role="status"]')).toHaveText('Ready');
  await page.waitForTimeout(1000);
  await expect(page.locator('.report-result')).toHaveCount(0);
  await page.getByRole('button', { name: 'Run report', exact: true }).click();
  await page.locator('[data-scenario="computation"]').getByRole('button', { name: 'Baseline', exact: true }).click();
  await expect(page.locator('.report-result')).toHaveCount(0);
  await expect(page.locator('.advanced-lab [role="status"]')).toHaveText('Ready');
});
test('Snapshot supports true offline access, refresh, reset and mode isolation', async ({ page, context }) => {
  await open(page, 'offline');
  await expect(page.getByRole('button', { name: 'Load snapshot' })).toBeEnabled({ timeout: 15000 });
  await page.evaluate(async () => {
    const cache = await caches.open('unrelated-check');
    await cache.put('/unrelated-check', new Response('retained'));
  });
  await page.getByRole('button', { name: 'Reset snapshot' }).click();
  expect(
    await page.evaluate(async () => (await caches.open('unrelated-check')).match('/unrelated-check').then(Boolean)),
  ).toBe(true);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.advanced-lab [role="status"]')).toContainText('Snapshot unavailable');
  await expect(page.locator('.snapshot-result')).toHaveCount(0);
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.snapshot-result')).toContainText('Source: network');
  const revision = await page.locator('[data-revision]').innerText();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.snapshot-result')).toContainText('Source: saved');
  await expect(page.locator('[data-revision]')).toHaveText(revision);
  await open(page, 'offline', 'Baseline');
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.advanced-lab [role="status"]')).toContainText('Snapshot unavailable');
  await expect(page.locator('.snapshot-result')).toHaveCount(0);
  await open(page, 'offline');
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.snapshot-result')).toContainText('Source: saved');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.snapshot-result')).toContainText('Source: network');
  expect(Number(await page.locator('[data-revision]').innerText())).toBeGreaterThan(Number(revision));
  await page.getByRole('button', { name: 'Reset snapshot' }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Load snapshot' }).click();
  await expect(page.locator('.advanced-lab [role="status"]')).toContainText('Snapshot unavailable');
  await context.setOffline(false);
});
test('Modes persist and damaged or unavailable storage does not prevent startup', async ({ page }) => {
  await open(page, 'context', 'Baseline');
  await page.reload();
  await page.getByRole('tab', { name: /Advanced/ }).click();
  await expect(page.locator('[data-scenario="context"] button.selected')).toHaveText('Baseline');
  await page.evaluate(() => sessionStorage.setItem('marketlab-modes', 'null'));
  await page.reload();
  await page.getByRole('tab', { name: /Advanced/ }).click();
  await expect(page.locator('[data-scenario="context"] button.selected')).toHaveText('Optimized');
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Unavailable');
    };
  });
  await page.reload();
  await open(page, 'scheduling');
});
