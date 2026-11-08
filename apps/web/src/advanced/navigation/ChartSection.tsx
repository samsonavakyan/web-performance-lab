import { use, useEffect, useState } from 'react';
import type { Candle } from '../../types';
import { fetchJson } from './data';
import type { Section } from './data';
import { ChartView, Skeleton } from './views';

type Ready = (section: Section) => void;

export function FetchingChart({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<Candle[]>(`/api/lab/instrument/${symbol}/history`, controller.signal)
      .then(setCandles)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);
  useEffect(() => {
    if (candles) onReady('chart');
  }, [candles, onReady]);
  return candles ? <ChartView candles={candles} /> : <Skeleton label="chart" height={210} />;
}

export function SuspenseChart({ history, onReady }: { history: Promise<Candle[]>; onReady: Ready }) {
  const candles = use(history);
  useEffect(() => onReady('chart'), [candles, onReady]);
  return <ChartView candles={candles} />;
}
