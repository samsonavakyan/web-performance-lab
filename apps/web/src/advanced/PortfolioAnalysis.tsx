import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../types';
import { calculateReport, makeSamples } from './computation';
import type { Report } from './computation';

export function PortfolioAnalysis({ mode }: { mode: Mode }) {
  const [size, setSize] = useState(2000000);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Report | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [calculation, setCalculation] = useState(0);
  const [error, setError] = useState('');
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const runId = useRef(0);
  function stop() {
    ++runId.current;
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
  }
  useEffect(
    () => () => {
      stop();
    },
    [],
  );
  function run() {
    stop();
    const id = runId.current;
    setBusy(true);
    setResult(null);
    setError('');
    const started = performance.now();
    performance.clearMarks('report:start');
    performance.clearMarks('report:end');
    performance.clearMeasures('report');
    performance.mark('report:start');
    const finish = (report?: Report, message = '', calculationMs = 0) => {
      if (id !== runId.current) return;
      setElapsed(performance.now() - started);
      setCalculation(calculationMs);
      performance.mark('report:end');
      performance.measure('report', 'report:start', 'report:end');
      setResult(report ?? null);
      setError(message);
      setBusy(false);
      worker.current?.terminate();
      worker.current = null;
    };
    timer.current = window.setTimeout(() => {
      try {
        const values = makeSamples(size);
        if (mode === 'baseline') {
          const calculationStart = performance.now();
          const report = calculateReport(values);
          finish(report, '', performance.now() - calculationStart);
        } else {
          if (!('Worker' in window)) {
            finish(undefined, 'This browser cannot run this mode.');
            return;
          }
          const next = new Worker(new URL('./report.worker.ts', import.meta.url), { type: 'module' });
          worker.current = next;
          next.onmessage = (
            event: MessageEvent<{ id: number; report?: Report; error?: string; calculationMs?: number }>,
          ) => {
            if (event.data.id === id) finish(event.data.report, event.data.error, event.data.calculationMs);
          };
          next.onerror = () => finish(undefined, 'Report unavailable');
          next.onmessageerror = () => finish(undefined, 'Report unavailable');
          next.postMessage({ id, buffer: values.buffer }, [values.buffer]);
        }
      } catch {
        finish(undefined, 'Report unavailable');
      }
    }, 50);
  }
  return (
    <>
      <div className="advanced-controls">
        <label>
          Samples{' '}
          <select aria-label="Samples" disabled={busy} value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value={500000}>500,000</option>
            <option value={2000000}>2,000,000</option>
            <option value={4000000}>4,000,000</option>
          </select>
        </label>
        <button disabled={busy} onClick={run}>
          Run report
        </button>
        <button
          disabled={!busy}
          onClick={() => {
            stop();
            setBusy(false);
          }}
        >
          Cancel report
        </button>
        <span role="status">{busy ? 'Running' : error || 'Ready'}</span>
      </div>
      <label className="analysis-note">
        Note <input aria-label="Report note" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {result && (
        <div className="report-result">
          <div className="report-values">
            <div>
              <span>Samples</span>
              <strong>{result.count.toLocaleString('en-US')}</strong>
            </div>
            <div>
              <span>Mean</span>
              <strong>{result.mean.toFixed(8)}</strong>
            </div>
            <div>
              <span>Median</span>
              <strong>{result.median.toFixed(8)}</strong>
            </div>
            <div>
              <span>95th percentile</span>
              <strong>{result.p95.toFixed(8)}</strong>
            </div>
          </div>
          <div className="report-timing">
            <span>Calculation: {calculation.toFixed(0)} ms</span>
            <span>Elapsed: {elapsed.toFixed(0)} ms</span>
          </div>
        </div>
      )}
    </>
  );
}
