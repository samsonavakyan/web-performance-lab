import { rngFrom } from './data/random.mjs';

// Lab-only controls. Nothing in the product calls these routes; the Performance Lab panel does.
export function registerLab(app, feed) {
  app.post('/api/lab/feed/sleep', async () => ({ frozen: feed.freeze(true) }));
  app.post('/api/lab/feed/wake', async () => ({ clients: feed.freeze(false) }));

  // Other users are simulated on the server: a browser tab opens only one WebSocket handshake per host at a time,
  // so forty sockets from one tab cannot reproduce a synchronized reconnect. They follow the case's reconnect policy.
  const random = rngFrom(4243);
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
      if (!feed.admit()) scheduleUser(attempt + 1);
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

  // Imitates a deploy: closes every connection and refuses new ones for a few seconds.
  app.post('/api/lab/feed/restart', async () => {
    const downUntil = feed.restart();
    clearUsers();
    users.connected = 0;
    for (let i = 0; i < users.count; i++) scheduleUser(0);
    return { downUntil };
  });

  app.get('/api/lab/feed/stats', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const { clients, ...stats } = feed.stats();
    return { connected: clients + users.connected, ...stats };
  });
}
