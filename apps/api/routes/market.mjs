import { makeCandles, makeOrderBook, makeOverview } from '../data/market.mjs';
import { NEWS } from '../data/news.mjs';
import { rngFrom } from '../data/random.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Routes of the main trading screen.
export function registerMarket(app, instruments) {
  const bySymbol = new Map(instruments.map((item) => [item.symbol, item]));

  app.get('/api/instruments', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const q = String(request.query?.q ?? '')
      .toLowerCase()
      .trim();
    const limit = Math.min(Math.max(Number(request.query?.limit || 2200), 1), 2200);
    const found = q
      ? instruments.filter((x) => x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q))
      : instruments;
    return found.slice(0, limit);
  });

  app.get('/api/history/:symbol', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = bySymbol.get(String(request.params.symbol).toUpperCase());
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    return makeCandles(item.symbol, 160, 784, item.price);
  });

  app.get('/api/orderbook/:symbol', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = bySymbol.get(String(request.params.symbol).toUpperCase());
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    return makeOrderBook(item.symbol, 160, item.price);
  });

  app.get('/api/news', async () => NEWS);

  // The full overview also carries the sector table for the market page; the summary has only what the strip shows.
  // `response` is a lab switch to make the endpoint fail or return malformed data.
  async function overview(request, reply, isFull) {
    reply.header('Cache-Control', 'no-store');
    await sleep(isFull ? 1100 : 60);
    if (request.query?.response === 'unavailable') return reply.code(500).send({ error: 'Overview unavailable' });
    if (request.query?.response === 'invalid') {
      return { asOf: '2026-01-02T15:30:00Z', title: 'Market pulse', highlights: null, extras: [] };
    }
    return makeOverview(isFull, instruments);
  }
  app.get('/api/overview', (request, reply) => overview(request, reply, true));
  app.get('/api/overview/summary', (request, reply) => overview(request, reply, false));

  // Quote stream for the watchlist and order book: a batch of random quotes every 700 ms.
  const random = rngFrom(2026);
  let sequence = 0;
  app.get('/ws/quotes', { websocket: true }, (socket) => {
    socket.send(JSON.stringify({ kind: 'connected' }));
    const timer = setInterval(() => {
      const updates = Array.from({ length: 18 }, () => {
        const item = instruments[Math.floor(random() * instruments.length)];
        return {
          symbol: item.symbol,
          price: +(item.price * (1 + (random() - 0.5) * 0.006)).toFixed(2),
          change: +(item.change + (random() - 0.5) * 0.4).toFixed(2),
        };
      });
      if (socket.readyState === 1) socket.send(JSON.stringify({ kind: 'quotes', seq: ++sequence, updates }));
    }, 700);
    socket.on('close', () => clearInterval(timer));
    socket.on('error', () => clearInterval(timer));
  });
}
