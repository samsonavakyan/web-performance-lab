import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { makeInstruments, makeCandles, makeOrderBook, makeOverview, NEWS, rngFrom } from './data.mjs';

const app = Fastify({ logger: true });
await app.register(websocket);
const instruments = makeInstruments();
const bySymbol = new Map(instruments.map(item => [item.symbol, item]));
let sequence = 0;
const random = rngFrom(2026);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
app.get('/api/health', async () => ({ok: true}));
app.get('/api/instruments', async (request, reply) => {
  reply.header('Cache-Control', 'no-store');
  const q = String(request.query?.q ?? '').toLowerCase().trim();
  const limit = Math.min(Math.max(Number(request.query?.limit || 2200), 1), 2200);
  return q ? instruments.filter(x => x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q)).slice(0, limit)
    : instruments.slice(0, limit);
});
app.get('/api/history/:symbol', async (request, reply) => {
  reply.header('Cache-Control', 'no-store');
  const symbol = String(request.params.symbol).toUpperCase();
  if (!bySymbol.has(symbol)) return reply.code(404).send({error: 'Unknown symbol'});
  return makeCandles(symbol, 160, 784, bySymbol.get(symbol).price);
});
app.get('/api/orderbook/:symbol', async (request, reply) => {
  reply.header('Cache-Control', 'no-store');
  const symbol = String(request.params.symbol).toUpperCase();
  if (!bySymbol.has(symbol)) return reply.code(404).send({error: 'Unknown symbol'});
  return makeOrderBook(symbol, 160, bySymbol.get(symbol).price);
});
app.get('/api/news', async () => NEWS);
app.get('/api/overview', async (request, reply) => {
  const mode = request.query?.mode === 'baseline' ? 'baseline' : 'optimized';
  reply.header('Cache-Control', 'no-store');
  if (mode === 'baseline') await sleep(1100);
  else await sleep(60);
  return makeOverview(mode);
});

app.get('/ws/quotes', { websocket: true }, (socket) => {
  socket.send(JSON.stringify({kind: 'connected'}));
  const timer = setInterval(() => {
    const updates = Array.from({length: 18}, () => {
      const item = instruments[Math.floor(random() * instruments.length)];
      return {symbol: item.symbol, price: +(item.price * (1 + (random() - .5) * .006)).toFixed(2), change: +(item.change + (random() - .5) * .4).toFixed(2)};
    });
    if (socket.readyState === 1) socket.send(JSON.stringify({kind: 'quotes', seq: ++sequence, updates}));
  }, 700);
  socket.on('close', () => clearInterval(timer));
  socket.on('error', () => clearInterval(timer));
});

const port = Number(process.env.PORT || 8787);
await app.listen({port, host: '0.0.0.0'});
