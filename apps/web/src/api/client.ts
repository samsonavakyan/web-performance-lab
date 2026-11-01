import type { BookLevel, Candle, Instrument, Mode, NewsItem, Overview } from '../types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

export const api = {
  instruments: () => request<Instrument[]>('/api/instruments'),
  news: () => request<NewsItem[]>('/api/news'),
  history: (symbol: string) => request<Candle[]>(`/api/history/${symbol}`),
  orderBook: (symbol: string) => request<BookLevel[]>(`/api/orderbook/${symbol}`),
  overview: (mode: Mode, signal: AbortSignal) => request<Overview>(`/api/overview?mode=${mode}`, { signal }),
};
