import { lazy, Suspense, useEffect, useState } from 'react';
import type { BookLevel } from '../../types';
import { fetchJson } from './data';
import type { Section } from './data';
import { BookView, Skeleton } from './views';

const NewsSection = lazy(() => import('./NewsSection').then((module) => ({ default: module.NewsSection })));

export function SideSection({ symbol, onReady }: { symbol: string; onReady: (section: Section) => void }) {
  const [levels, setLevels] = useState<BookLevel[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson<BookLevel[]>(`/api/instruments/${symbol}/book`, controller.signal)
      .then(setLevels)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);


  useEffect(() => {
    if (levels) onReady('book');
  }, [levels, onReady]);
  if (!levels) return <Skeleton label="order book" height={300} />;

  return (
    <>
      <BookView levels={levels} />
      <Suspense fallback={<Skeleton label="news" />}>
        <NewsSection symbol={symbol} onReady={onReady} />
      </Suspense>
    </>
  );
}
