import type { NewsItem } from '../../types';
import { instrumentApi } from './data';
import { useReportReady } from './readiness';
import { useFetch } from './useFetch';
import { NewsView, Skeleton } from './views';

export function NewsFeed({ symbol }: { symbol: string }) {
  const items = useFetch<NewsItem[]>(instrumentApi.news(symbol));

  useReportReady('news', items !== null);

  return items ? <NewsView items={items} /> : <Skeleton label="news" />;
}
