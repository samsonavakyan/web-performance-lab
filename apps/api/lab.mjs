import { makeCandles, makeOrderBook, makeTrades, NEWS, rngFrom } from './data.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Routes for the Advanced cases. Latencies are fixed so that waterfalls and races are reproducible.
export function registerLab(app, instruments) {
  const bySymbol = new Map(instruments.map((item) => [item.symbol, item]));
  const known = (symbol) => bySymbol.get(String(symbol).toUpperCase());

  // Instrument page: four independent resources with server-side latency.
  app.get('/api/lab/instrument/:symbol', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = known(request.params.symbol);
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    await sleep(350);
    const { sparkline: _sparkline, id: _id, ...info } = item;
    return info;
  });
  app.get('/api/lab/instrument/:symbol/history', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = known(request.params.symbol);
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    await sleep(450);
    return makeCandles(item.symbol, 120, 784, item.price);
  });
  app.get('/api/lab/instrument/:symbol/book', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = known(request.params.symbol);
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    await sleep(300);
    return makeOrderBook(item.symbol, 14, item.price);
  });
  app.get('/api/lab/instrument/:symbol/news', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const item = known(request.params.symbol);
    if (!item) return reply.code(404).send({ error: 'Unknown symbol' });
    await sleep(250);
    return NEWS.map((news) => ({ ...news, title: `${item.symbol}: ${news.title}` }));
  });

  // Trade export.
  const tradeBodies = new Map();
  app.get('/api/lab/trades', async (request, reply) => {
    const count = Math.min(Math.max(Number(request.query?.count) || 100_000, 1), 300_000);
    if (!tradeBodies.has(count)) tradeBodies.set(count, JSON.stringify(makeTrades(count)));
    reply.header('Cache-Control', 'no-store');
    reply.type('application/json');
    return tradeBodies.get(count);
  });

  // Live feed with sequence numbers, replay buffer and failure simulation controls.
  const feed = { seq: 0, price: 143.76, buffer: [], clients: new Set(), downUntil: 0, warmUntil: 0, attempts: [], admitted: new Map() };
  // After a restart the server is refused for 3 s, then warms up and admits at most 8 connections per 250 ms for 5 s.
  const admit = () => {
    const now = Date.now();
    feed.attempts.push(now);
    if (now < feed.downUntil) return false;
    if (now >= feed.warmUntil) return true;
    const bucket = Math.floor(now / 250);
    const count = feed.admitted.get(bucket) ?? 0;
    if (count >= 8) return false;
    feed.admitted.set(bucket, count + 1);
    return true;
  };
  const random = rngFrom(4242);
  const send = (client, message) => {
    if (!client.frozen && client.socket.readyState === 1) client.socket.send(message);
  };
  setInterval(() => {
    feed.seq += 1;
    feed.price = +(feed.price * (1 + (random() - 0.5) * 0.002)).toFixed(2);
    const message = { kind: 'quote', seq: feed.seq, price: feed.price, time: Date.now() };
    feed.buffer.push(message);
    if (feed.buffer.length > 3000) feed.buffer.shift();
    const text = JSON.stringify(message);
    for (const client of feed.clients) send(client, text);
  }, 200);
  setInterval(() => {
    const text = JSON.stringify({ kind: 'heartbeat', seq: feed.seq, time: Date.now() });
    for (const client of feed.clients) send(client, text);
  }, 1000);

  // While restarting or warming up, excess upgrades are refused with 503.
  const refuseWhileDown = async (_request, reply) => {
    if (!admit()) return reply.code(503).send({ error: 'Server is restarting' });
  };
  app.get('/ws/lab/feed', { websocket: true, preValidation: refuseWhileDown }, (socket, request) => {
    const client = { socket, frozen: false };
    feed.clients.add(client);
    const from = Number(request.query?.from);
    if (from > 0) {
      const first = feed.buffer[0]?.seq ?? feed.seq + 1;
      if (from + 1 < first) socket.send(JSON.stringify({ kind: 'reset', seq: feed.seq }));
      else for (const message of feed.buffer) if (message.seq > from) socket.send(JSON.stringify(message));
    }
    socket.on('close', () => feed.clients.delete(client));
    socket.on('error', () => feed.clients.delete(client));
  });
  // Stops delivery to every open socket without closing it.
  app.post('/api/lab/feed/sleep', async () => {
    for (const client of feed.clients) client.frozen = true;
    return { frozen: feed.clients.size };
  });
  app.post('/api/lab/feed/wake', async () => {
    for (const client of feed.clients) client.frozen = false;
    return { clients: feed.clients.size };
  });
  // Other users are simulated on the server: a browser tab allows only one WebSocket handshake per host at a time,
  // so forty sockets from one tab cannot reproduce a synchronized reconnect.
  const users = { count: 0, policy: 'baseline', connected: 0, timers: new Set() };
  const clearUsers = () => {
    for (const timer of users.timers) clearTimeout(timer);
    users.timers.clear();
  };
  const scheduleUser = (attempt) => {
    const ceiling = Math.min(10_000, 1000 * 2 ** attempt);
    const delay = users.policy === 'baseline' ? 1000 : ceiling / 2 + random() * (ceiling / 2);
    const timer = setTimeout(() => {
      users.timers.delete(timer);
      if (!admit()) scheduleUser(attempt + 1);
      else users.connected += 1;
    }, delay);
    users.timers.add(timer);
  };
  app.post('/api/lab/feed/users', async (request) => {
    clearUsers();
    users.count = Math.min(Math.max(Number(request.query?.count) || 0, 0), 500);
    users.policy = request.query?.policy === 'optimized' ? 'optimized' : 'baseline';
    users.connected = users.count;
    return { count: users.count, policy: users.policy };
  });

  // Closes every connection and refuses new ones for three seconds.
  app.post('/api/lab/feed/restart', async () => {
    feed.downUntil = Date.now() + 3000;
    feed.warmUntil = feed.downUntil + 5000;
    feed.admitted.clear();
    for (const client of feed.clients) client.socket.close(1012, 'Service restart');
    feed.clients.clear();
    clearUsers();
    users.connected = 0;
    for (let i = 0; i < users.count; i++) scheduleUser(0);
    return { downUntil: feed.downUntil };
  });
  app.get('/api/lab/feed/snapshot', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return { seq: feed.seq, price: feed.price, time: Date.now() };
  });
  app.get('/api/lab/feed/stats', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const now = Date.now();
    feed.attempts = feed.attempts.filter((time) => now - time < 15_000);
    const buckets = Array.from({ length: 60 }, () => 0);
    for (const time of feed.attempts) buckets[59 - Math.floor((now - time) / 250)] += 1;
    return { connected: feed.clients.size + users.connected, seq: feed.seq, restarting: now < feed.warmUntil, buckets };
  });
}
