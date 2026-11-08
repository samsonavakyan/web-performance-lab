import { useSyncExternalStore } from 'react';
import type { Quote } from '../../types';

// Quote store with immutable updates.
type State = { quotes: Record<string, Quote>; version: number };

let state: State = { quotes: {}, version: 0 };
const listeners = new Set<() => void>();

export const quoteStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  reset(quotes: Quote[]) {
    state = { quotes: Object.fromEntries(quotes.map((quote) => [quote.symbol, quote])), version: 0 };
    listeners.forEach((listener) => listener());
  },
  apply(updates: Quote[]) {
    const quotes = { ...state.quotes };
    for (const update of updates) quotes[update.symbol] = update;
    state = { quotes, version: state.version + 1 };
    listeners.forEach((listener) => listener());
  },
};

export function useQuoteState() {
  return useSyncExternalStore(quoteStore.subscribe, quoteStore.getState);
}

export function useQuote(symbol: string) {
  return useSyncExternalStore(quoteStore.subscribe, () => quoteStore.getState().quotes[symbol]);
}
