import { useEffect, useRef, useState } from 'react';
import { startTiming } from '../../lab/timings';
import { download } from './download';
import type { ExportProps } from './download';
import type { ExportMessage } from './export.worker';

type Result = { rows: number; bytes: number };

export function ExportPanel({ count, save, onBusyChange, children }: ExportProps) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const worker = useRef<Worker | null>(null);

  // Leaving the screen stops an export that is still running.
  useEffect(() => () => worker.current?.terminate(), []);

  function setRunning(next: boolean) {
    setBusy(next);
    onBusyChange(next);
  }

  function stopWorker() {
    worker.current?.terminate();
    worker.current = null;
  }

  function start() {
    setRunning(true);
    setProgress(0);
    setResult(null);
    setError('');
    const endTiming = startTiming('trade-export', 'trade export');
    const next = new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' });
    worker.current = next;
    next.onmessage = (event: MessageEvent<ExportMessage>) => {
      const message = event.data;
      if (message.kind === 'progress') {
        setProgress(message.done / message.total);

        return;
      }

      stopWorker();
      setRunning(false);
      if (message.kind === 'error') {
        setError(message.message);

        return;
      }

      endTiming();
      setResult({ rows: message.rows, bytes: message.blob.size });
      if (save) download(message.blob, message.rows);
    };
    next.postMessage({ url: new URL(`/api/trades?count=${count}`, location.href).href });
  }

  function cancel() {
    stopWorker();
    setRunning(false);
    setError('Export cancelled');
  }

  return (
    <>
      <div className="workspace-controls">
        {children}
        <button disabled={busy} onClick={start}>
          Export CSV
        </button>
        <button disabled={!busy} onClick={cancel}>
          Cancel
        </button>
        <span role="status">{busy ? `Exporting ${(progress * 100).toFixed(0)}%` : error || 'Ready'}</span>
      </div>
      {busy && <progress className="export-progress" value={progress} max={1} />}
      {result && (
        <p className="export-result">
          Saved {result.rows.toLocaleString('en-US')} trades, {(result.bytes / 1048576).toFixed(1)} MB
        </p>
      )}
    </>
  );
}
