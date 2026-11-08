import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../types';
import { LabSlot } from '../../lab/LabSlot';
import { CSV_HEADER, formatRow } from './csv';
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

type Result = { rows: number; bytes: number };

export function TradeExport({ mode }: { mode: Mode }) {
  const [count, setCount] = useState(100_000);
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const worker = useRef<Worker | null>(null);

  useEffect(() => () => worker.current?.terminate(), []);

  function finish(blob: Blob, rows: number, started: number) {
    performance.measure('trade export', { start: started, end: performance.now() });
    setResult({ rows, bytes: blob.size });
    setBusy(false);
    if (save) download(blob, rows);
  }

  async function exportOnMainThread(url: string, started: number) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const trades = (await response.json()) as Trade[];
      let csv = CSV_HEADER;
      for (const trade of trades) csv += formatRow(trade) + '\n';
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
      <LabSlot>
        <label className="checkbox" title="Downloads the CSV when the export finishes">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save file
        </label>
      </LabSlot>
      <div className="advanced-controls">
        <label>
          Trades
          <select aria-label="Trades" disabled={busy} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={50000}>50,000</option>
            <option value={100000}>100,000</option>
            <option value={300000}>300,000</option>
          </select>
        </label>
        <button disabled={busy} onClick={start}>
          Export CSV
        </button>
        <button disabled={!busy || mode === 'baseline'} onClick={cancel}>
          Cancel
        </button>
        <span role="status">
          {busy ? (mode === 'optimized' ? `Exporting ${(progress * 100).toFixed(0)}%` : 'Exporting') : error || 'Ready'}
        </span>
      </div>
      {mode === 'optimized' && busy && <progress className="export-progress" value={progress} max={1} />}
      {result && (
        <p className="export-result">
          Saved {result.rows.toLocaleString('en-US')} trades, {(result.bytes / 1048576).toFixed(1)} MB
        </p>
      )}
      <label className="analysis-note">
        Comment <input aria-label="Export comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
    </>
  );
}
