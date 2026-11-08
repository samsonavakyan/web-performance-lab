import { useEffect, useState } from 'react';
import type { NewsItem } from '../../types';
import { fetchJson } from './data';
import type { Section } from './data';
import { NewsView, Skeleton } from './views';

export function FetchingNews({ symbol, onReady }: { symbol: string; onReady: (section: Section) => void }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<NewsItem[]>(`/api/lab/instrument/${symbol}/news`, controller.signal)
      .then(setItems)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);
  useEffect(() => {
    if (items) onReady('news');
  }, [items, onReady]);
  return items ? <NewsView items={items} /> : <Skeleton label="news" />;
}
