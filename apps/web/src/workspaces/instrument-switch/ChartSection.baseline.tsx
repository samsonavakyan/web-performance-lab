import type { Candle } from '../../types';
import { instrumentApi } from './data';
import { useReportReady } from './readiness';
import { useFetch } from './useFetch';
import { ChartView, Skeleton } from './views';

export function ChartSection({ symbol }: { symbol: string }) {
  const candles = useFetch<Candle[]>(instrumentApi.candles(symbol));

  useReportReady('chart', candles !== null);

  return candles ? <ChartView candles={candles} /> : <Skeleton label="chart" height={210} />;
}
