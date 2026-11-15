import type { Quote } from '../../types';

// Simulated market socket for the order desk: an active market sends many small messages per second.
const MESSAGES_PER_SECOND = 120;
const UPDATES_PER_MESSAGE = 20;

type Listener = (updates: Quote[]) => void;
const listeners = new Set<Listener>();

export const quoteSocket = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  start(initial: Quote[]) {
    const quotes = new Map(initial.map((quote) => [quote.symbol, quote]));
    const symbols = [...quotes.keys()];
    const timer = window.setInterval(() => {
      const updates = Array.from({ length: UPDATES_PER_MESSAGE }, () => {
        const previous = quotes.get(symbols[Math.floor(Math.random() * symbols.length)])!;
        const next = {
          symbol: previous.symbol,
          price: +(previous.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2),
          change: +(previous.change + (Math.random() - 0.5) * 0.05).toFixed(2),
        };
        quotes.set(next.symbol, next);
        return next;
      });
      listeners.forEach((listener) => listener(updates));
    }, 1000 / MESSAGES_PER_SECOND);
    return () => clearInterval(timer);
  },
};
