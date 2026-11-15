import { rngFrom } from './data.mjs';

const QUOTE_INTERVAL = 200;
const HEARTBEAT_INTERVAL = 1000;
const REPLAY_BUFFER = 3000;

// Live price feed for one instrument. Every message has a seq, and the last messages are kept
// so a client that reconnects with ?from=<seq> gets what it missed.
export function registerFeed(app) {
  const random = rngFrom(4242);
  const feed = {
    seq: 0,
    price: 143.76,
    buffer: [],
    clients: new Set(),
    // Admission control after a restart: refuse everyone, then warm up and let a few in at a time.
    downUntil: 0,
    warmUntil: 0,
    admitted: new Map(),
    // Every connection attempt, for the lab's server monitoring chart.
    attempts: [],
  };

  // Refused for 3 s after a restart, then at most 8 connections per 250 ms for 5 s.
  function admit() {
    const now = Date.now();
    feed.attempts.push(now);
    if (now < feed.downUntil) return false;
    if (now >= feed.warmUntil) return true;
    const bucket = Math.floor(now / 250);
    const count = feed.admitted.get(bucket) ?? 0;
    if (count >= 8) return false;
    feed.admitted.set(bucket, count + 1);
    return true;
  }

  // A frozen client keeps its socket open but receives nothing, like a laptop that went to sleep.
  const send = (client, text) => {
    if (!client.frozen && client.socket.readyState === 1) client.socket.send(text);
  };
  const broadcast = (message) => {
    const text = JSON.stringify(message);
    for (const client of feed.clients) send(client, text);
  };

  setInterval(() => {
    feed.seq += 1;
    feed.price = +(feed.price * (1 + (random() - 0.5) * 0.002)).toFixed(2);
    const message = { kind: 'quote', seq: feed.seq, price: feed.price, time: Date.now() };
    feed.buffer.push(message);
    if (feed.buffer.length > REPLAY_BUFFER) feed.buffer.shift();
    broadcast(message);
  }, QUOTE_INTERVAL);
  setInterval(() => broadcast({ kind: 'heartbeat', seq: feed.seq, time: Date.now() }), HEARTBEAT_INTERVAL);

  const refuseWhileDown = async (_request, reply) => {
    if (!admit()) return reply.code(503).send({ error: 'Server is restarting' });
  };
  app.get('/ws/feed', { websocket: true, preValidation: refuseWhileDown }, (socket, request) => {
    const client = { socket, frozen: false };
    feed.clients.add(client);
    // Replay what the client missed, or ask it to take a snapshot if the buffer no longer has it.
    const from = Number(request.query?.from);
    if (from > 0) {
      const first = feed.buffer[0]?.seq ?? feed.seq + 1;
      if (from + 1 < first) socket.send(JSON.stringify({ kind: 'reset', seq: feed.seq }));
      else for (const message of feed.buffer) if (message.seq > from) socket.send(JSON.stringify(message));
    }
    socket.on('close', () => feed.clients.delete(client));
    socket.on('error', () => feed.clients.delete(client));
  });

  app.get('/api/feed/snapshot', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return { seq: feed.seq, price: feed.price, time: Date.now() };
  });

  // Controls used by the lab to simulate failures.
  return {
    admit,
    freeze: (isFrozen) => {
      for (const client of feed.clients) client.frozen = isFrozen;
      return feed.clients.size;
    },
    restart() {
      feed.downUntil = Date.now() + 3000;
      feed.warmUntil = feed.downUntil + 5000;
      feed.admitted.clear();
      for (const client of feed.clients) client.socket.close(1012, 'Service restart');
      feed.clients.clear();
      return feed.downUntil;
    },
    stats() {
      const now = Date.now();
      feed.attempts = feed.attempts.filter((time) => now - time < 15_000);
      const buckets = Array.from({ length: 60 }, () => 0);
      for (const time of feed.attempts) buckets[59 - Math.floor((now - time) / 250)] += 1;
      return { clients: feed.clients.size, seq: feed.seq, restarting: now < feed.warmUntil, buckets };
    },
  };
}
