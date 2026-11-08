import { memo, useDeferredValue, useState } from 'react';
import type { Mode } from '../types';

function QueryRow({ query, index }: { query: string; index: number }) {
  let score = index;
  const seed = [...query].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  for (let i = 0; i < 20000; i++) score += Math.sin(i + seed + index) * Math.cos(i / 7);
  return (
    <div className="query-row">
      <span>Asset {String(index + 1).padStart(3, '0')}</span>
      <span>{score.toFixed(4)}</span>
    </div>
  );
}
const QueryResults = memo(function QueryResults({ query, workload }: { query: string; workload: number }) {
  return (
    <div className="query-results" data-query={query}>
      <p>
        Results for: <strong>{query || 'All assets'}</strong>
      </p>
      {Array.from({ length: workload }, (_, index) => (
        <QueryRow key={index} query={query} index={index} />
      ))}
    </div>
  );
});
export function QueryWorkspace({ mode, workload }: { mode: Mode; workload: number }) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);
  const deferred = useDeferredValue(query);
  const value = mode === 'optimized' ? deferred : query;
  return (
    <>
      <div className="advanced-controls">
        <label>
          Query <input aria-label="Workspace query" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button onClick={() => setCount((c) => c + 1)}>Check interaction: {count}</button>
        <span role="status">{query === value ? 'Ready' : 'Updating results'}</span>
      </div>
      <QueryResults query={value} workload={workload} />
    </>
  );
}
