import type { Mode } from '../../types';

type Message =
  | { kind: 'quote'; seq: number; price: number; time: number }
  | { kind: 'heartbeat'; seq: number; time: number }
  | { kind: 'reset'; seq: number };

export type FeedStatus = 'connecting' | 'live' | 'stale' | 'reconnecting' | 'closed';

const STALE_AFTER = 3000;
const BASE_DELAY = 1000;
const MAX_DELAY = 10_000;

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

  private readonly isOptimized: boolean;

  constructor(mode: Mode) {
    this.isOptimized = mode === 'optimized';
    this.connect();
    // Optimized treats silence as a dead connection: no message, heartbeats included, for STALE_AFTER ms means reconnect.
    if (this.isOptimized) this.watchdog = window.setInterval(() => this.checkStale(), 500);
  }

  private connect() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    // Optimized resumes from the last seq, and the server replays what was missed.
    const resume = this.isOptimized && this.lastSeq ? `?from=${this.lastSeq}` : '';
    const socket = new WebSocket(`${protocol}://${location.host}/ws/lab/feed${resume}`);
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
    if (this.isOptimized && this.status === 'stale') this.status = 'live';
    if (message.kind === 'reset') {
      void this.resync();
      return;
    }
    if (message.kind !== 'quote' || message.seq <= this.lastSeq) return;
    // Optimized treats a gap in seq as lost messages and takes a fresh snapshot.
    if (this.isOptimized && this.lastSeq && message.seq > this.lastSeq + 1) void this.resync();
    this.lastSeq = message.seq;
    this.price = message.price;
    this.attempt = 0;
  }

  private async resync() {
    const response = await fetch('/api/lab/feed/snapshot');
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
    // Optimized uses exponential backoff with equal jitter, so clients do not reconnect in waves.
    const delay = this.isOptimized ? ceiling / 2 + Math.random() * (ceiling / 2) : 1000;
    this.attempt += 1;
    this.retryAt = Date.now() + delay;
    if (this.status !== 'stale') this.status = 'reconnecting';
    this.retryTimer = window.setTimeout(() => this.connect(), delay);
  }

  dispose() {
    this.disposed = true;
    this.status = 'closed';
    clearTimeout(this.retryTimer);
    clearInterval(this.watchdog);
    this.socket?.close();
    this.socket = null;
  }
}
