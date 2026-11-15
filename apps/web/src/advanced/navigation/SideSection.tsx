import { Suspense, use, useEffect } from 'react';
import type { BookLevel, NewsItem } from '../../types';
import type { Section } from './data';
import { BookView, NewsView, Skeleton } from './views';

type Ready = (section: Section) => void;

function BookSection({ book, onReady }: { book: Promise<BookLevel[]>; onReady: Ready }) {
  const levels = use(book);
  useEffect(() => onReady('book'), [levels, onReady]);
  return <BookView levels={levels} />;
}

function NewsSection({ news, onReady }: { news: Promise<NewsItem[]>; onReady: Ready }) {
  const items = use(news);
  useEffect(() => onReady('news'), [items, onReady]);
  return <NewsView items={items} />;
}

export function SideSection({
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
        <BookSection book={book} onReady={onReady} />
      </Suspense>
      <Suspense fallback={<Skeleton label="news" />}>
        <NewsSection news={news} onReady={onReady} />
      </Suspense>
    </>
  );
}
