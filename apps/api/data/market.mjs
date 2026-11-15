import { makeInstruments } from './instruments.mjs';
import { rngFrom } from './random.mjs';

export function makeCandles(symbol = 'NVDA', count = 160, seed = 784, startingPrice) {
  let hash = seed;
  for (const ch of symbol) hash = (Math.imul(hash, 33) ^ ch.charCodeAt(0)) >>> 0;
  const rand = rngFrom(hash);
  let price = startingPrice ?? (symbol === 'BTCUSD' ? 67000 : symbol === 'NVDA' ? 143 : 210);
  const candles = [];
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = Math.max(1, open * (1 + (rand() - 0.49) * 0.019));
    const high = Math.max(open, close) * (1 + rand() * 0.008);
    const low = Math.min(open, close) * (1 - rand() * 0.008);
    const volume = 500_000 + Math.round(rand() * 7_000_000);
    candles.push({
      time: i,
      open: +open.toFixed(3),
      close: +close.toFixed(3),
      high: +high.toFixed(3),
      low: +low.toFixed(3),
      volume,
    });
    price = close;
  }
  // History ends at the current price, so the chart agrees with quotes and the order book.
  if (startingPrice === undefined) return candles;
  const scale = startingPrice / candles[candles.length - 1].close;
  const round = (value) => +(value * scale).toFixed(3);
  return candles.map((c) => ({
    ...c,
    open: round(c.open),
    close: round(c.close),
    high: round(c.high),
    low: round(c.low),
  }));
}

export function makeOrderBook(symbol = 'NVDA', rows = 85, startingPrice) {
  const rand = rngFrom(Array.from(symbol).reduce((acc, ch) => acc + ch.charCodeAt(0), 245));
  const center = startingPrice ?? (symbol === 'BTCUSD' ? 67000 : 143.76);
  return Array.from({ length: rows }, (_, i) => ({
    id: i,
    bid: +(center - 0.02 * (i + 1)).toFixed(2),
    ask: +(center + 0.02 * (i + 1)).toFixed(2),
    bidSize: Math.round(40 + rand() * 700),
    askSize: Math.round(40 + rand() * 700),
  }));
}

const OVERVIEW_SYMBOLS = ['NVDA', 'BTCUSD', 'SPY', 'TSLA'];

export function makeOverview(full = false, instruments = makeInstruments()) {
  const random = rngFrom(777);
  const highlights = OVERVIEW_SYMBOLS.map((symbol) => {
    const { price, change } = instruments.find((item) => item.symbol === symbol);
    return { symbol, price, change };
  });
  return {
    asOf: '2026-01-02T15:30:00Z',
    title: 'Market pulse',
    highlights,
    extras: full
      ? Array.from({ length: 12000 }, (_, i) => ({
          id: i,
          x: random(),
          y: random(),
          z: random(),
          sector: 'Technology',
        }))
      : [],
  };
}
