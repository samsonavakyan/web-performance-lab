import { test, expect, type CDPSession, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

async function open(page: Page, id: string, mode: 'Baseline' | 'Optimized') {
  await page.getByRole('tab', { name: /Advanced/ }).click();
  const scenario = page.locator(`[data-scenario="${id}"]`);
  await scenario.getByRole('button', { name: mode, exact: true }).click();
  await scenario.getByRole('button', { name: 'Open case' }).click();
  await expect(page.getByRole('region', { name: 'Advanced Lab' })).toBeVisible();
}

async function windowListeners(cdp: CDPSession, type: string) {
  const win = await cdp.send('Runtime.evaluate', { expression: 'window' });
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: win.result.objectId! });
  return listeners.filter((listener) => listener.type === type).length;
}

async function canvasesInMemory(cdp: CDPSession) {
  await cdp.send('HeapProfiler.enable');
  await cdp.send('HeapProfiler.collectGarbage');
  const proto = await cdp.send('Runtime.evaluate', { expression: 'HTMLCanvasElement.prototype' });
  const { objects } = await cdp.send('Runtime.queryObjects', { prototypeObjectId: proto.result.objectId! });
  const length = await cdp.send('Runtime.callFunctionOn', {
    objectId: objects.objectId!,
    functionDeclaration: 'function () { return this.length; }',
    returnByValue: true,
  });
  return length.result.value as number;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Instrument monitor keeps listeners and canvases after switching instruments', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await page.goto('/');
    await open(page, 'leak', mode);
    const select = page.getByRole('combobox', { name: 'Instrument' });
    await expect(select.locator('option')).toHaveCount(150);
    for (const value of ['1', '2', '3', '4', '5']) {
      await select.selectOption(value);
      await expect(page.locator('canvas')).toHaveCount(1);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(500);
    const listeners = await windowListeners(cdp, 'resize');
    const canvases = await canvasesInMemory(cdp);
    if (mode === 'Baseline') {
      expect(listeners).toBeGreaterThanOrEqual(6);
      expect(canvases).toBeGreaterThanOrEqual(6);
    } else {
      expect(listeners).toBe(1);
      expect(canvases).toBeLessThanOrEqual(2);
    }
  }
});

test('Trade export produces the same file and blocks the main thread only in Baseline', async ({ page }) => {
  const results: Record<string, { hash: string; block: number }> = {};
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'export', mode);
    await page.getByRole('combobox', { name: 'Trades' }).selectOption('50000');
    await page.evaluate(() => {
      const frames: number[] = [];
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => frames.push(entry.duration))).observe({
        type: 'long-animation-frame',
      });
      (window as unknown as { longFrames: number[] }).longFrames = frames;
    });
    const download = page.waitForEvent('download', { timeout: 40000 });
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const file = await (await download).path();
    await expect(page.getByText('Saved 50,000 trades')).toBeVisible();
    results[mode] = {
      hash: createHash('sha256')
        .update(await readFile(file))
        .digest('hex'),
      block: await page.evaluate(() => Math.max(0, ...(window as unknown as { longFrames: number[] }).longFrames)),
    };
  }
  expect(results.Baseline.hash).toBe(results.Optimized.hash);
  expect(results.Baseline.block).toBeGreaterThan(Math.max(500, results.Optimized.block * 3));
});

test('Live feed status through sleep, wake and restart', async ({ page }) => {
  test.setTimeout(60000);
  for (const mode of ['Baseline', 'Optimized'] as const) {
    await open(page, 'reconnect', mode);
    const panel = page.locator('.lab-slot');
    await panel.getByRole('checkbox').uncheck();
    const badge = page.locator('.feed-badge');
    await expect(badge).toHaveText(mode === 'Baseline' ? 'Connected' : 'Live', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await panel.getByRole('button', { name: 'Simulate sleep' }).click();
    await page.waitForTimeout(500);
    const frozen = await page.locator('.feed-quote strong').innerText();
    await page.waitForTimeout(4000);
    if (mode === 'Baseline') {
      await expect(badge).toHaveText('Connected');
      await expect(page.locator('.feed-quote strong')).toHaveText(frozen);
    } else {
      await expect(badge).toHaveText('Live');
    }
    await panel.getByRole('button', { name: 'Wake up' }).click();
    await panel.getByRole('button', { name: 'Restart server' }).click();
    await expect(badge).toHaveText(mode === 'Baseline' ? 'Connected' : 'Live', { timeout: 20000 });
  }
});
