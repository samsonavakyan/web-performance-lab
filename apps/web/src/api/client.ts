import type { BookLevel, Candle, Instrument, Mode, NewsItem, Overview } from '../types';

export type OverviewResponse = 'normal' | 'unavailable' | 'invalid';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

function isOverview(value: unknown): value is Overview {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Partial<Overview>;
  return (
    typeof data.asOf === 'string' &&
    Number.isFinite(Date.parse(data.asOf)) &&
    typeof data.title === 'string' &&
    Array.isArray(data.extras) &&
    Array.isArray(data.highlights) &&
    data.highlights.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.symbol === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        typeof item.change === 'number' &&
        Number.isFinite(item.change),
    )
  );
}

async function overview(mode: Mode, signal: AbortSignal, response: OverviewResponse = 'normal'): Promise<Overview> {
  const query = new URLSearchParams({ mode });
  if (response !== 'normal') query.set('response', response);
  const data = await request<unknown>(`/api/overview?${query}`, { signal });
  if (!isOverview(data)) throw new Error('Unexpected response');
  return data;
}

export const api = {
  instruments: () => request<Instrument[]>('/api/instruments'),
  news: () => request<NewsItem[]>('/api/news'),
  history: (symbol: string) => request<Candle[]>(`/api/history/${symbol}`),
  orderBook: (symbol: string) => request<BookLevel[]>(`/api/orderbook/${symbol}`),
  overview,
};
