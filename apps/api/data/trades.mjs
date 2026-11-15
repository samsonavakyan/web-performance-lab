import { makeInstruments } from './instruments.mjs';
import { rngFrom } from './random.mjs';

// Trades of a whole year for the export screen.
const ACCOUNTS = ['DESK-01', 'DESK-02', 'DESK-07', 'PROP-11', 'CLIENT-34', 'CLIENT-58'];
export function makeTrades(count = 100_000, seed = 9001) {
  const rand = rngFrom(seed);
  const universe = makeInstruments(120);
  const start = Date.UTC(2025, 0, 2, 9, 30);
  const trades = new Array(count);
  let time = start;
  for (let i = 0; i < count; i++) {
    const item = universe[Math.floor(rand() * universe.length)];
    time += Math.round(rand() * 95_000);
    const qty = 1 + Math.floor(rand() * 900);
    const price = +(item.price * (1 + (rand() - 0.5) * 0.04)).toFixed(2);
    trades[i] = {
      id: 100_000_000 + i,
      time: new Date(time).toISOString(),
      symbol: item.symbol,
      name: item.name,
      side: rand() > 0.5 ? 'BUY' : 'SELL',
      quantity: qty,
      price,
      fee: +(qty * price * 0.0004).toFixed(2),
      account: ACCOUNTS[Math.floor(rand() * ACCOUNTS.length)],
    };
  }
  return trades;
}
