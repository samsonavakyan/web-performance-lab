// Shared quote client, like a WebSocket wrapper that many widgets subscribe to.
type Listener = (price: number) => void;

const listeners = new Map<string, Set<Listener>>();
const prices = new Map<string, number>();
let timer: number | undefined;
let deliveries = 0;

function tick() {
  for (const [symbol, set] of listeners) {
    const price = (prices.get(symbol) ?? 100) * (1 + (Math.random() - 0.5) * 0.004);
    prices.set(symbol, price);
    for (const listener of set) {
      deliveries += 1;
      listener(price);
    }
  }
}

export const quoteFeed = {
  subscribe(symbol: string, startPrice: number, listener: Listener) {
    if (!prices.has(symbol)) prices.set(symbol, startPrice);
    const set = listeners.get(symbol) ?? new Set();
    set.add(listener);
    listeners.set(symbol, set);
    timer ??= window.setInterval(tick, 200);
    return () => {
      set.delete(listener);
      if (!set.size) listeners.delete(symbol);
      if (!listeners.size) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  },
  listenerCount() {
    let count = 0;
    for (const set of listeners.values()) count += set.size;
    return count;
  },
  takeDeliveries() {
    const value = deliveries;
    deliveries = 0;
    return value;
  },
};
