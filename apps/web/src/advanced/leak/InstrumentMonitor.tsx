import { useEffect, useRef, useState } from 'react';
import type { Candle, Instrument, Mode } from '../../types';
import { Metric } from '../metrics';
import { MiniChart } from './MiniChart';
import { quoteFeed } from './quoteFeed';

const HISTORY_LIMIT = 20;
const historyCache = new Map<string, Candle[]>();

async function loadHistory(symbol: string, mode: Mode): Promise<Candle[]> {
  const cached = historyCache.get(symbol);
  if (cached) {
    if (mode === 'optimized') {
      historyCache.delete(symbol);
      historyCache.set(symbol, cached);
    }
    return cached;
  }
  const response = await fetch(`/api/history/${symbol}`);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const candles = (await response.json()) as Candle[];
  historyCache.set(symbol, candles);
  if (mode === 'optimized' && historyCache.size > HISTORY_LIMIT) {
    historyCache.delete(historyCache.keys().next().value!);
  }
  return candles;
}

function PriceChart({ instrument, mode }: { instrument: Instrument; mode: Mode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [last, setLast] = useState(instrument.price);

  useEffect(() => {
    let active = true;
    loadHistory(instrument.symbol, mode).then((data) => active && setCandles(data));
    return () => {
      active = false;
    };
  }, [instrument.symbol, mode]);

  useEffect(() => {
    if (!candles || !canvas.current) return;
    const chart = new MiniChart(canvas.current, candles);
    const unsubscribe = quoteFeed.subscribe(instrument.symbol, candles[candles.length - 1].close, (price) => {
      chart.update(price);
      setLast(price);
    });
    if (mode === 'baseline') return;
    return () => {
      unsubscribe();
      chart.destroy();
    };
  }, [candles, instrument, mode]);

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

function heapMb() {
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
  return memory ? `${(memory.usedJSHeapSize / 1048576).toFixed(0)} MB` : 'n/a';
}

export function InstrumentMonitor({ mode }: { mode: Mode }) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [index, setIndex] = useState(0);
  const [switches, setSwitches] = useState(0);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ listeners: 0, charts: 0, cache: 0, deliveries: 0, heap: heapMb() });

  useEffect(() => {
    fetch('/api/instruments?limit=150')
      .then((response) => response.json())
      .then(setInstruments);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStats({
        listeners: quoteFeed.listenerCount(),
        charts: MiniChart.alive,
        cache: historyCache.size,
        deliveries: quoteFeed.takeDeliveries(),
        heap: heapMb(),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!running) return;
    let step = 0;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % instruments.length);
      setSwitches((count) => count + 1);
      if (++step === 80) {
        clearInterval(timer);
        setRunning(false);
      }
    }, 250);
    return () => clearInterval(timer);
  }, [running, instruments.length]);

  const instrument = instruments[index];
  return (
    <>
      <p>
        A trader keeps this screen open all day and switches instruments. Simulate trading day switches 80 instruments
        in 20 seconds. Reload page resets the case.
      </p>
      <div className="advanced-controls">
        <label>
          Instrument
          <select
            aria-label="Instrument"
            value={index}
            onChange={(event) => {
              setIndex(Number(event.target.value));
              setSwitches((count) => count + 1);
            }}
          >
            {instruments.map((item, i) => (
              <option key={item.symbol} value={i}>
                {item.symbol}
              </option>
            ))}
          </select>
        </label>
        <button disabled={running || !instruments.length} onClick={() => setRunning(true)}>
          Simulate trading day
        </button>
        <button onClick={() => location.reload()}>Reload page</button>
        <span role="status">{running ? 'Switching' : 'Ready'}</span>
      </div>
      <div className="metric-grid">
        <Metric label="Switches" value={String(switches)} />
        <Metric label="Feed listeners" value={String(stats.listeners)} tone={stats.listeners > 1 ? 'bad' : undefined} />
        <Metric label="Live charts" value={String(stats.charts)} tone={stats.charts > 1 ? 'bad' : undefined} />
        <Metric label="Cached histories" value={String(stats.cache)} />
        <Metric label="Feed callbacks / s" value={String(stats.deliveries)} />
        <Metric label="JS heap" value={stats.heap} />
      </div>
      {instrument && <PriceChart key={instrument.symbol} instrument={instrument} mode={mode} />}
    </>
  );
}
