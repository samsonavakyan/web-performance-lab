import { useEffect, useRef, useState } from 'react';
import type { Candle, Instrument, Mode } from '../../types';
import { LabSlot } from '../../lab/LabSlot';
import { MiniChart } from './MiniChart';
import { quoteFeed } from './quoteFeed';

const HISTORY_LIMIT = 20;
const TRADING_DAY = 80;
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

function PriceChart({
  instrument,
  mode,
  onReady,
}: {
  instrument: Instrument;
  mode: Mode;
  onReady: (symbol: string) => void;
}) {
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
    onReady(instrument.symbol);
    if (mode === 'baseline') return;
    return () => {
      unsubscribe();
      chart.destroy();
    };
  }, [candles, instrument, mode, onReady]);

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

export function InstrumentMonitor({ mode }: { mode: Mode }) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [readySymbol, setReadySymbol] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/instruments?limit=150')
      .then((response) => response.json())
      .then(setInstruments);
  }, []);


  const instrument = instruments[index];
  const running = remaining > 0;

  // Switches to the next instrument once the current chart is on screen.
  useEffect(() => {
    if (!running || readySymbol !== instrument?.symbol) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % instruments.length);
      setRemaining((count) => count - 1);
    }, 150);
    return () => clearTimeout(timer);
  }, [running, readySymbol, instrument, instruments.length]);
  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button
            disabled={running || !instruments.length}
            onClick={() => setRemaining(TRADING_DAY)}
            title="Switches through 80 instruments one by one, the way a trader does during a working day"
          >
            Simulate trading day
          </button>
        </div>
        <span role="status">{running ? `Switching ${TRADING_DAY - remaining}/${TRADING_DAY}` : 'Ready'}</span>
      </LabSlot>
      <div className="advanced-controls">
        <label>
          Instrument
          <select
            aria-label="Instrument"
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
          >
            {instruments.map((item, i) => (
              <option key={item.symbol} value={i}>
                {item.symbol}
              </option>
            ))}
          </select>
        </label>
      </div>
      {instrument && (
        <PriceChart key={instrument.symbol} instrument={instrument} mode={mode} onReady={setReadySymbol} />
      )}
      <label className="analysis-note">
        Trade note <input aria-label="Trade note" value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
    </>
  );
}
