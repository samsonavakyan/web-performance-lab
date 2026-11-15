import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { makeInstruments } from './data/instruments.mjs';
import { registerFeed } from './feed.mjs';
import { registerLab } from './lab.mjs';
import { registerMarket } from './routes/market.mjs';
import { registerWorkspaces } from './routes/workspaces.mjs';

const app = Fastify({ logger: true });
await app.register(websocket);

const instruments = makeInstruments();
app.get('/api/health', async () => ({ ok: true }));
registerMarket(app, instruments);
registerWorkspaces(app, instruments);
const feed = registerFeed(app);
registerLab(app, feed);

const port = Number(process.env.PORT || 8787);
await app.listen({ port, host: '0.0.0.0' });
