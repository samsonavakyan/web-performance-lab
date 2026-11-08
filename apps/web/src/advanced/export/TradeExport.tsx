import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../types';
import { Metric, useLongestBlock } from '../metrics';
import { CSV_HEADER, formatRowSlow } from './csv';
import type { Trade } from './csv';
import type { ExportMessage } from './export.worker';

function download(blob: Blob, rows: number) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trades-${rows}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(timer);
  }, []);
  return <Metric label="UI clock" value={now.toLocaleTimeString('en-GB') + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 1)} />;
}

type Result = { rows: number; bytes: number; elapsed: number };

export function TradeExport({ mode }: { mode: Mode }) {
  const [count, setCount] = useState(100_000);
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const worker = useRef<Worker | null>(null);
  const { longest, reset } = useLongestBlock();

  useEffect(() => () => worker.current?.terminate(), []);

  function finish(blob: Blob, rows: number, started: number) {
    performance.measure('trade export', { start: started, end: performance.now() });
    setResult({ rows, bytes: blob.size, elapsed: performance.now() - started });
    setBusy(false);
    if (save) download(blob, rows);
  }

  async function exportOnMainThread(url: string, started: number) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const trades = (await response.json()) as Trade[];
      let csv = CSV_HEADER;
      for (const trade of trades) csv += formatRowSlow(trade) + '\n';
      finish(new Blob([csv], { type: 'text/csv' }), trades.length, started);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
      setBusy(false);
    }
  }

  function exportInWorker(url: string, started: number) {
    const next = new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' });
    worker.current = next;
    next.onmessage = (event: MessageEvent<ExportMessage>) => {
      const message = event.data;
      if (message.kind === 'progress') setProgress(message.done / message.total);
      else {
        next.terminate();
        worker.current = null;
        if (message.kind === 'done') finish(message.blob, message.rows, started);
        else {
          setError(message.message);
          setBusy(false);
        }
      }
    };
    next.postMessage({ url: new URL(url, location.href).href });
  }

  function start() {
    reset();
    setBusy(true);
    setProgress(0);
    setResult(null);
    setError('');
    const url = `/api/lab/trades?count=${count}`;
    const started = performance.now();
    if (mode === 'baseline') void exportOnMainThread(url, started);
    else exportInWorker(url, started);
  }

  function cancel() {
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
    setError('Export cancelled');
  }

  return (
    <>
      <p>
        Back office exports every trade for the year. The API returns all rows as one JSON array, the app converts them to
        CSV and saves the file. Type a comment while the export runs.
      </p>
      <div className="advanced-controls">
        <label>
          Trades
          <select aria-label="Trades" disabled={busy} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={50000}>50,000</option>
            <option value={100000}>100,000</option>
            <option value={300000}>300,000</option>
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save file
        </label>
        <button disabled={busy} onClick={start}>
          Export CSV
        </button>
        <button disabled={!busy || mode === 'baseline'} onClick={cancel}>
          Cancel
        </button>
        <span role="status">{busy ? (mode === 'optimized' ? `Exporting ${(progress * 100).toFixed(0)}%` : 'Exporting') : error || 'Ready'}</span>
      </div>
      {mode === 'optimized' && busy && <progress className="export-progress" value={progress} max={1} />}
      <div className="metric-grid">
        <Clock />
        <Metric label="Longest main-thread block" value={`${longest.toFixed(0)} ms`} tone={longest > 200 ? 'bad' : longest ? 'good' : undefined} />
        <Metric label="Export time" value={result ? `${(result.elapsed / 1000).toFixed(1)} s` : '-'} />
        <Metric label="File" value={result ? `${result.rows.toLocaleString('en-US')} rows · ${(result.bytes / 1048576).toFixed(1)} MB` : '-'} />
      </div>
      <label className="analysis-note">
        Comment <input aria-label="Export comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
    </>
  );
}
