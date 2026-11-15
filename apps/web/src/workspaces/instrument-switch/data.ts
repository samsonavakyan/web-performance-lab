import type { BookLevel, Candle, NewsItem } from '../../types';

export type InstrumentInfo = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
};

export const SYMBOLS = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOGL', 'BTCUSD'];

// The instrument page is built from four independent API resources.
export const instrumentApi = {
  info: (symbol: string) => `/api/instruments/${symbol}`,
  candles: (symbol: string) => `/api/instruments/${symbol}/candles`,
  book: (symbol: string) => `/api/instruments/${symbol}/book`,
  news: (symbol: string) => `/api/instruments/${symbol}/news`,
};

export type InstrumentData = {
  info: InstrumentInfo;
  candles: Candle[];
  book: BookLevel[];
  news: NewsItem[];
};

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  return (await response.json()) as T;
}
