import { useState } from 'react';
import { startTiming } from '../../lab/timings';
import { CSV_HEADER } from './csv';
import type { Trade } from './csv';
import { formatTradeRow } from './csv.baseline';
import { download } from './download';
import type { ExportProps } from './download';

type Result = { rows: number; bytes: number };

export function ExportPanel({ count, save, onBusyChange, children }: ExportProps) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  function setRunning(next: boolean) {
    setBusy(next);
    onBusyChange(next);
  }

  async function start() {
    setRunning(true);
    setResult(null);
    setError('');
    const endTiming = startTiming('trade-export', 'trade export');
    try {
      const response = await fetch(`/api/trades?count=${count}`);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const trades = (await response.json()) as Trade[];
      let csv = CSV_HEADER;
      for (const trade of trades) csv += formatTradeRow(trade) + '\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      endTiming();
      setResult({ rows: trades.length, bytes: blob.size });
      if (save) download(blob, trades.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    }
    setRunning(false);
  }

  return (
    <>
      <div className="workspace-controls">
        {children}
        <button disabled={busy} onClick={start}>
          Export CSV
        </button>
        <span role="status">{busy ? 'Exporting' : error || 'Ready'}</span>
      </div>
      {result && (
        <p className="export-result">
          Saved {result.rows.toLocaleString('en-US')} trades, {(result.bytes / 1048576).toFixed(1)} MB
        </p>
      )}
    </>
  );
}
