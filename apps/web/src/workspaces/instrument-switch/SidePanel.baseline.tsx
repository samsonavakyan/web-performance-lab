import { lazy, Suspense } from 'react';
import type { BookLevel } from '../../types';
import { instrumentApi } from './data';
import { useReportReady } from './readiness';
import { useFetch } from './useFetch';
import { BookView, Skeleton } from './views';

// News is a secondary widget, so its code is loaded only when the panel renders it.
const NewsFeed = lazy(() => import('./NewsFeed.baseline').then((module) => ({ default: module.NewsFeed })));

// Order book first, news below it.
export function SidePanel({ symbol }: { symbol: string }) {
  const levels = useFetch<BookLevel[]>(instrumentApi.book(symbol));

  useReportReady('book', levels !== null);
  if (!levels) return <Skeleton label="order book" height={300} />;

  return (
    <>
      <BookView levels={levels} />
      <Suspense fallback={<Skeleton label="news" />}>
        <NewsFeed symbol={symbol} />
      </Suspense>
    </>
  );
}
