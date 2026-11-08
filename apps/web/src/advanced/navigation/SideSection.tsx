import { lazy, Suspense, use, useEffect, useState } from 'react';
import type { BookLevel, NewsItem } from '../../types';
import { fetchJson } from './data';
import type { Section } from './data';
import { BookView, NewsView, Skeleton } from './views';

type Ready = (section: Section) => void;

const LazyNews = lazy(() => import('./NewsSection').then((module) => ({ default: module.FetchingNews })));

export function FetchingSide({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const [levels, setLevels] = useState<BookLevel[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<BookLevel[]>(`/api/lab/instrument/${symbol}/book`, controller.signal)
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
        <LazyNews symbol={symbol} onReady={onReady} />
      </Suspense>
    </>
  );
}

function SuspenseBook({ book, onReady }: { book: Promise<BookLevel[]>; onReady: Ready }) {
  const levels = use(book);
  useEffect(() => onReady('book'), [levels, onReady]);
  return <BookView levels={levels} />;
}
function SuspenseNews({ news, onReady }: { news: Promise<NewsItem[]>; onReady: Ready }) {
  const items = use(news);
  useEffect(() => onReady('news'), [items, onReady]);
  return <NewsView items={items} />;
}

export function SuspenseSide({
  book,
  news,
  onReady,
}: {
  book: Promise<BookLevel[]>;
  news: Promise<NewsItem[]>;
  onReady: Ready;
}) {
  return (
    <>
      <Suspense fallback={<Skeleton label="order book" height={300} />}>
        <SuspenseBook book={book} onReady={onReady} />
      </Suspense>
      <Suspense fallback={<Skeleton label="news" />}>
        <SuspenseNews news={news} onReady={onReady} />
      </Suspense>
    </>
  );
}
