import { Suspense, use } from 'react';
import type { BookLevel, NewsItem } from '../../types';
import { useReportReady } from './readiness';
import { BookView, NewsView, Skeleton } from './views';

function BookSection({ book }: { book: Promise<BookLevel[]> }) {
  const levels = use(book);
  useReportReady('book', true);

  return <BookView levels={levels} />;
}

function NewsSection({ news }: { news: Promise<NewsItem[]> }) {
  const items = use(news);
  useReportReady('news', true);

  return <NewsView items={items} />;
}

// Order book first, news below it. Each shows up as soon as its own request resolves.
export function SidePanel({ book, news }: { book: Promise<BookLevel[]>; news: Promise<NewsItem[]> }) {
  return (
    <>
      <Suspense fallback={<Skeleton label="order book" height={300} />}>
        <BookSection book={book} />
      </Suspense>
      <Suspense fallback={<Skeleton label="news" />}>
        <NewsSection news={news} />
      </Suspense>
    </>
  );
}
