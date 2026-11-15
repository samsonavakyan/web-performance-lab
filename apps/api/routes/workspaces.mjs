import { makeCandles, makeOrderBook, makeTrades, NEWS } from '../data.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const instrumentHeadlines = ({ symbol, name, sector }) =>
  sector === 'Crypto'
    ? [
        `${name} holds steady as crypto volumes climb`,
        `Funding rates for ${symbol} turn positive`,
        `Exchange outflows of ${symbol} rise for a third day`,
        `${name} trades in a narrow range overnight`,
      ]
    : [
        `${name} trades in line with the ${sector.toLowerCase()} sector`,
        `Analysts update price targets for ${symbol}`,
        `${symbol} options volume rises ahead of the next report`,
        `${name} shares open steady after a quiet session`,
      ];

// Routes of the workspace screens. Latencies are fixed, so request timing is the same on every run.
export function registerWorkspaces(app, instruments) {
  const bySymbol = new Map(instruments.map((item) => [item.symbol, item]));

  // Instrument page: details, price history, order book and news are separate resources.
  const instrumentRoute = (path, latency, load) =>
    app.get(path, async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      const item = bySymbol.get(String(request.params.symbol).toUpperCase());
      if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
      await sleep(latency);
      return load(item);
    });
  instrumentRoute('/api/instruments/:symbol', 350, ({ sparkline: _sparkline, id: _id, ...info }) => info);
  instrumentRoute('/api/instruments/:symbol/candles', 450, (item) => makeCandles(item.symbol, 120, 784, item.price));
  instrumentRoute('/api/instruments/:symbol/book', 300, (item) => makeOrderBook(item.symbol, 14, item.price));
  instrumentRoute('/api/instruments/:symbol/news', 250, (item) =>
    instrumentHeadlines(item).map((title, i) => ({
      id: NEWS[i].id,
      time: NEWS[i].time,
      title,
      source: NEWS[i].source,
    })),
  );

  // Trade export: every trade of the year. Bodies are cached, so only the client work differs between runs.
  const tradeBodies = new Map();
  app.get('/api/trades', async (request, reply) => {
    const count = Math.min(Math.max(Number(request.query?.count) || 100_000, 1), 300_000);
    if (!tradeBodies.has(count)) tradeBodies.set(count, JSON.stringify(makeTrades(count)));
    reply.header('Cache-Control', 'no-store');
    reply.type('application/json');
    return tradeBodies.get(count);
  });
}
