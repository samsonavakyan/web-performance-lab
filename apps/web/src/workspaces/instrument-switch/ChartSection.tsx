import { use, useEffect } from 'react';
import type { Candle } from '../../types';
import type { Section } from './data';
import { ChartView } from './views';

export function ChartSection({ history, onReady }: { history: Promise<Candle[]>; onReady: (section: Section) => void }) {
  const candles = use(history);
  useEffect(() => onReady('chart'), [candles, onReady]);
  return <ChartView candles={candles} />;
}
