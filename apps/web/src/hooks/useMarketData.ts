import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { BookLevel, Candle, Instrument, NewsItem } from '../types';

export function useMarketData(symbol: string) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [levels, setLevels] = useState<BookLevel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.instruments(), api.news()])
      .then(([nextInstruments, nextNews]) => {
        if (!active) return;
        setInstruments(nextInstruments);
        setNews(nextNews);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.history(symbol), api.orderBook(symbol)])
      .then(([nextCandles, nextLevels]) => {
        if (!active) return;
        setCandles(nextCandles);
        setLevels(nextLevels);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [symbol]);

  return { instruments, news, candles, levels, error };
}
