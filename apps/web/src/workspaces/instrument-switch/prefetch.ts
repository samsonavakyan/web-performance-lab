import { fetchJson, instrumentApi } from './data';
import type { InstrumentData } from './data';

type Pending = { [K in keyof InstrumentData]: Promise<InstrumentData[K]> };

// Code of the page sections, split into their own chunks.
export const loadChartSection = () => import('./ChartSection');
export const loadSidePanel = () => import('./SidePanel');

const prefetched = new Map<string, Pending>();

// Starts every request and code chunk an instrument page needs and returns the pending promises.
// Calling it again for the same symbol returns the same promises, so a hover, a click and the render
// all share one set of requests. Components read the promises with use().
export function prefetchInstrument(symbol: string): Pending {
  let pending = prefetched.get(symbol);
  if (!pending) {
    pending = {
      info: fetchJson(instrumentApi.info(symbol)),
      candles: fetchJson(instrumentApi.candles(symbol)),
      book: fetchJson(instrumentApi.book(symbol)),
      news: fetchJson(instrumentApi.news(symbol)),
    };
    prefetched.set(symbol, pending);
  }

  void loadChartSection();
  void loadSidePanel();

  return pending;
}

// Forgets prefetched data, so the next visit loads from the network again.
export function clearPrefetched() {
  prefetched.clear();
}
