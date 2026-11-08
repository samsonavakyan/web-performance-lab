import type { BookLevel, Candle, NewsItem } from '../../types';

export type InstrumentInfo = { symbol: string; name: string; sector: string; price: number; change: number; volume: number };
export type Section = 'info' | 'chart' | 'book' | 'news';
export const SYMBOLS = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOGL', 'BTCUSD'];

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

export const loadChartCode = () => import('./ChartSection');
export const loadSideCode = () => import('./SideSection');

type Resources = { info: Promise<InstrumentInfo>; history: Promise<Candle[]>; book: Promise<BookLevel[]>; news: Promise<NewsItem[]> };
const resources = new Map<string, Resources>();

export function preloadInstrument(symbol: string): Resources {
  let entry = resources.get(symbol);
  if (!entry) {
    const base = `/api/lab/instrument/${symbol}`;
    entry = {
      info: fetchJson(base),
      history: fetchJson(`${base}/history`),
      book: fetchJson(`${base}/book`),
      news: fetchJson(`${base}/news`),
    };
    resources.set(symbol, entry);
  }
  void loadChartCode();
  void loadSideCode();
  return entry;
}

export function clearResources() {
  resources.clear();
}
