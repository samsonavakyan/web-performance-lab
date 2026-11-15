import { useEffect, useState } from 'react';
import type { Candle } from '../../types';
import { fetchJson } from './data';
import type { Section } from './data';
import { ChartView, Skeleton } from './views';

export function ChartSection({ symbol, onReady }: { symbol: string; onReady: (section: Section) => void }) {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<Candle[]>(`/api/instruments/${symbol}/candles`, controller.signal)
      .then(setCandles)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);
  useEffect(() => {
    if (candles) onReady('chart');
  }, [candles, onReady]);
  return candles ? <ChartView candles={candles} /> : <Skeleton label="chart" height={210} />;
}
