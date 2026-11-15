import { useEffect, useRef, useState } from 'react';
import type { Candle, Instrument } from '../../types';
import { MiniChart } from './MiniChart';
import { quoteFeed } from './quoteFeed';

const historyCache = new Map<string, Candle[]>();

async function loadHistory(symbol: string): Promise<Candle[]> {
  const cached = historyCache.get(symbol);
  if (cached) return cached;

  const response = await fetch(`/api/history/${symbol}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  const candles = (await response.json()) as Candle[];
  historyCache.set(symbol, candles);

  return candles;
}

type Props = { instrument: Instrument; onReady: (symbol: string) => void };

export function PriceChart({ instrument, onReady }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [last, setLast] = useState(instrument.price);

  useEffect(() => {
    let active = true;
    loadHistory(instrument.symbol).then((data) => active && setCandles(data));

    return () => {
      active = false;
    };
  }, [instrument.symbol]);

  useEffect(() => {
    if (!candles || !canvas.current) return;

    const chart = new MiniChart(canvas.current, candles);
    quoteFeed.subscribe(instrument.symbol, candles[candles.length - 1].close, (price) => {
      chart.update(price);
      setLast(price);
    });
    onReady(instrument.symbol);
  }, [candles, instrument, onReady]);

  return (
    <div className="monitor-chart">
      <div className="monitor-chart-head">
        <strong>{instrument.symbol}</strong>
        <span>{instrument.name}</span>
        <strong>{last.toFixed(2)}</strong>
      </div>
      <canvas ref={canvas} aria-label={`${instrument.symbol} price chart`} />
    </div>
  );
}
