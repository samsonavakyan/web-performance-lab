import { measureSince } from '../../lab/timings';

type Message =
  | { kind: 'quote'; seq: number; price: number; time: number }
  | { kind: 'heartbeat'; seq: number; time: number }
  | { kind: 'reset'; seq: number };

export type FeedStatus = 'connecting' | 'live' | 'reconnecting' | 'closed';

const RECONNECT_DELAY = 1000;
const QUOTE_GAP = 1500;

export class FeedClient {
  status: FeedStatus = 'connecting';
  price = 0;
  lastSeq = 0;
  private socket: WebSocket | null = null;
  private retryTimer: number | undefined;
  private disposed = false;
  private lastQuoteAt = 0;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${location.host}/ws/lab/feed`);
    this.socket = socket;
    socket.onopen = () => {
      this.status = 'live';
    };
    socket.onmessage = (event) => this.handle(JSON.parse(String(event.data)) as Message);
    socket.onclose = () => {
      if (this.socket !== socket || this.disposed) return;
      this.socket = null;
      this.status = 'reconnecting';
      this.retryTimer = window.setTimeout(() => this.connect(), RECONNECT_DELAY);
    };
  }

  private handle(message: Message) {
    if (message.kind === 'reset') {
      void this.resync();
      return;
    }
    if (message.kind !== 'quote' || message.seq <= this.lastSeq) return;
    this.trackQuoteGap();
    this.lastSeq = message.seq;
    this.price = message.price;
  }

  private async resync() {
    const response = await fetch('/api/lab/feed/snapshot');
    const snapshot = (await response.json()) as { seq: number; price: number };
    if (snapshot.seq >= this.lastSeq) {
      this.lastSeq = snapshot.seq;
      this.price = snapshot.price;
    }
  }

  private trackQuoteGap() {
    const now = performance.now();
    if (this.lastQuoteAt && now - this.lastQuoteAt > QUOTE_GAP) measureSince('live-feed', 'no quotes', this.lastQuoteAt);
    this.lastQuoteAt = now;
  }

  dispose() {
    this.disposed = true;
    this.status = 'closed';
    clearTimeout(this.retryTimer);
    this.socket?.close();
    this.socket = null;
  }
}
