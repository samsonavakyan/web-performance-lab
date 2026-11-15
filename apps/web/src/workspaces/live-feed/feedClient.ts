import { measureSince } from '../../lab/timings';

type Message =
  | { kind: 'quote'; seq: number; price: number; time: number }
  | { kind: 'heartbeat'; seq: number; time: number }
  | { kind: 'reset'; seq: number };

export type FeedStatus = 'connecting' | 'live' | 'stale' | 'reconnecting' | 'closed';

const STALE_AFTER = 3000;
const BASE_DELAY = 1000;
const MAX_DELAY = 10_000;
const QUOTE_GAP = 1500;

export class FeedClient {
  status: FeedStatus = 'connecting';
  price = 0;
  lastSeq = 0;
  lastMessageAt = 0;
  retryAt = 0;
  private socket: WebSocket | null = null;
  private attempt = 0;
  private retryTimer: number | undefined;
  private watchdog: number | undefined;
  private disposed = false;
  private lastQuoteAt = 0;

  constructor() {
    this.connect();
    // No message, heartbeats included, for STALE_AFTER ms means the connection is dead.
    this.watchdog = window.setInterval(() => this.checkStale(), 500);
  }

  private connect() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    // Resumes from the last seq, and the server replays what was missed.
    const resume = this.lastSeq ? `?from=${this.lastSeq}` : '';
    const socket = new WebSocket(`${protocol}://${location.host}/ws/feed${resume}`);
    this.socket = socket;
    this.status = this.attempt ? 'reconnecting' : 'connecting';
    socket.onopen = () => {
      this.status = 'live';
      this.lastMessageAt = Date.now();
    };
    socket.onmessage = (event) => this.handle(JSON.parse(String(event.data)) as Message);
    socket.onclose = () => {
      if (this.socket !== socket || this.disposed) return;

      this.socket = null;
      this.scheduleReconnect();
    };
  }

  private handle(message: Message) {
    this.lastMessageAt = Date.now();
    if (this.status === 'stale') this.status = 'live';

    if (message.kind === 'reset') {
      void this.resync();

      return;
    }

    if (message.kind !== 'quote' || message.seq <= this.lastSeq) return;

    // A gap in seq means lost messages, so the client takes a fresh snapshot.
    if (this.lastSeq && message.seq > this.lastSeq + 1) void this.resync();

    this.trackQuoteGap();
    this.lastSeq = message.seq;
    this.price = message.price;
    this.attempt = 0;
  }

  private async resync() {
    const response = await fetch('/api/feed/snapshot').catch(() => null);
    if (!response?.ok) return;

    const snapshot = (await response.json()) as { seq: number; price: number };
    if (snapshot.seq >= this.lastSeq) {
      this.lastSeq = snapshot.seq;
      this.price = snapshot.price;
    }
  }

  private checkStale() {
    if (this.status !== 'live' || Date.now() - this.lastMessageAt < STALE_AFTER) return;

    this.status = 'stale';
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    const ceiling = Math.min(MAX_DELAY, BASE_DELAY * 2 ** this.attempt);
    // Exponential backoff with equal jitter, so clients do not reconnect in waves.
    const delay = ceiling / 2 + Math.random() * (ceiling / 2);
    this.attempt += 1;
    this.retryAt = Date.now() + delay;
    if (this.status !== 'stale') this.status = 'reconnecting';

    this.retryTimer = window.setTimeout(() => this.connect(), delay);
  }

  private trackQuoteGap() {
    const now = performance.now();
    if (this.lastQuoteAt && now - this.lastQuoteAt > QUOTE_GAP)
      measureSince('live-feed', 'no quotes', this.lastQuoteAt);
    this.lastQuoteAt = now;
  }

  dispose() {
    this.disposed = true;
    this.status = 'closed';
    clearTimeout(this.retryTimer);
    clearInterval(this.watchdog);
    // Closing a socket that is still connecting aborts the handshake and leaves a failed request in DevTools.
    const socket = this.socket;
    if (socket?.readyState === WebSocket.CONNECTING) socket.onopen = () => socket.close();
    else socket?.close();
    this.socket = null;
  }
}
