import test from 'node:test';
import assert from 'node:assert/strict';
import {makeInstruments, makeCandles, makeOrderBook, makeOverview} from './data.mjs';

test('fixtures are reproducible', () => {
  assert.deepEqual(makeInstruments(100), makeInstruments(100));
  assert.deepEqual(makeCandles('NVDA'), makeCandles('NVDA'));
});
test('instrument universe is unique', () => {
  const symbols = makeInstruments().map(x => x.symbol);
  assert.equal(symbols.length, 2200);
  assert.equal(new Set(symbols).size, symbols.length);
});
test('candles and book are well-formed', () => {
  const candles = makeCandles('NVDA');
  assert.equal(candles.length, 160);
  assert.ok(candles.every(x => x.high >= Math.max(x.open, x.close) && x.low <= Math.min(x.open, x.close)));
  assert.equal(makeOrderBook('NVDA').length, 85);
});
test('overview responses differ across modes', () => {
  assert.equal(makeOverview('baseline').extras.length, 12000);
  assert.equal(makeOverview('optimized').extras.length, 0);
});

test('overview visible data is identical across modes', () => {
  const {extras: a, ...baseline} = makeOverview('baseline');
  const {extras: b, ...optimized} = makeOverview('optimized');
  assert.deepEqual(baseline, optimized);
});

test('trades are reproducible and well-formed', async () => {
  const {makeTrades} = await import('./data.mjs');
  const trades = makeTrades(500);
  assert.deepEqual(trades, makeTrades(500));
  assert.equal(new Set(trades.map(t => t.id)).size, 500);
  assert.ok(trades.every(t => t.quantity > 0 && t.price > 0 && (t.side === 'BUY' || t.side === 'SELL')));
});
