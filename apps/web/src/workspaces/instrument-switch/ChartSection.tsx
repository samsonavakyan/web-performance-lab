import { use } from 'react';
import type { Candle } from '../../types';
import { useReportReady } from './readiness';
import { ChartView } from './views';

// Receives a request that is already in flight; use() suspends until it resolves.
export function ChartSection({ candles }: { candles: Promise<Candle[]> }) {
  const data = use(candles);
  useReportReady('chart', true);

  return <ChartView candles={data} />;
}
