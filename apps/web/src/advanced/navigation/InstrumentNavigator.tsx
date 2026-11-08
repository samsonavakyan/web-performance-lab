import { lazy, Suspense, use, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { Mode } from '../../types';
import { Metric } from '../metrics';
import { clearResources, fetchJson, loadChartCode, loadSideCode, preloadInstrument, SYMBOLS } from './data';
import type { InstrumentInfo, Section } from './data';
import { InfoView, Skeleton } from './views';

type Ready = (section: Section) => void;

const FetchingChart = lazy(() => import('./ChartSection').then((module) => ({ default: module.FetchingChart })));
const FetchingSide = lazy(() => import('./SideSection').then((module) => ({ default: module.FetchingSide })));
const SuspenseChart = lazy(() => loadChartCode().then((module) => ({ default: module.SuspenseChart })));
const SuspenseSide = lazy(() => loadSideCode().then((module) => ({ default: module.SuspenseSide })));

function PageSkeleton() {
  return (
    <div className="nav-page">
      <Skeleton label="instrument" height={64} />
      <div className="nav-body">
        <Skeleton label="chart" height={210} />
        <Skeleton label="order book" height={300} />
      </div>
    </div>
  );
}

function BaselinePage({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const [info, setInfo] = useState<InstrumentInfo | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<InstrumentInfo>(`/api/lab/instrument/${symbol}`, controller.signal)
      .then(setInfo)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);
  useEffect(() => {
    if (info) onReady('info');
  }, [info, onReady]);
  if (!info) return <PageSkeleton />;
  return (
    <div className="nav-page">
      <InfoView info={info} />
      <div className="nav-body">
        <Suspense fallback={<Skeleton label="chart" height={210} />}>
          <FetchingChart symbol={symbol} onReady={onReady} />
        </Suspense>
        <aside>
          <Suspense fallback={<Skeleton label="order book" height={300} />}>
            <FetchingSide symbol={symbol} onReady={onReady} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

function OptimizedPage({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const resources = preloadInstrument(symbol);
  const info = use(resources.info);
  useEffect(() => onReady('info'), [info, onReady]);
  return (
    <div className="nav-page">
      <InfoView info={info} />
      <div className="nav-body">
        <Suspense fallback={<Skeleton label="chart" height={210} />}>
          <SuspenseChart history={resources.history} onReady={onReady} />
        </Suspense>
        <aside>
          <SuspenseSide book={resources.book} news={resources.news} onReady={onReady} />
        </aside>
      </div>
    </div>
  );
}

export function InstrumentNavigator({ mode }: { mode: Mode }) {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [isPending, startTransition] = useTransition();
  const [duration, setDuration] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const target = useRef(SYMBOLS[0]);
  const started = useRef(performance.now());
  const ready = useRef(new Set<Section>());
  useState(clearResources);

  const report = useCallback((owner: string, section: Section) => {
    if (owner !== target.current || ready.current.has(section)) return;
    ready.current.add(section);
    if (ready.current.size === 4) {
      const elapsed = performance.now() - started.current;
      performance.measure(`instrument ${owner}`, { start: started.current, duration: elapsed });
      setDuration(elapsed);
      setHistory((items) => [...items.slice(-5), elapsed]);
    }
  }, []);
  const onReady = useMemo<Ready>(() => (section) => report(symbol, section), [report, symbol]);

  function navigate(next: string) {
    if (next === symbol) return;
    target.current = next;
    started.current = performance.now();
    ready.current = new Set();
    setDuration(null);
    if (mode === 'baseline') {
      setSymbol(next);
      return;
    }
    preloadInstrument(next);
    startTransition(() => setSymbol(next));
  }

  return (
    <>
      <p>Each instrument page needs details, price history, order book and news. Record Network and switch instruments.</p>
      <div className="advanced-controls">
        <button
          onClick={() => {
            clearResources();
            setHistory([]);
          }}
        >
          Clear data cache
        </button>
        <span role="status">{duration === null ? 'Loading' : 'Ready'}</span>
      </div>
      <div className="metric-grid">
        <Metric label="Page complete" value={duration === null ? '...' : `${duration.toFixed(0)} ms`} />
        <Metric label="Recent" value={history.map((value) => value.toFixed(0)).join(' · ') || '-'} />
      </div>
      <div className="nav-layout">
        <nav className="nav-list" aria-label="Instruments">
          {SYMBOLS.map((item) => (
            <button
              key={item}
              aria-current={item === symbol ? 'page' : undefined}
              onClick={() => navigate(item)}
              onMouseEnter={mode === 'optimized' ? () => preloadInstrument(item) : undefined}
              onFocus={mode === 'optimized' ? () => preloadInstrument(item) : undefined}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className={isPending ? 'nav-content pending' : 'nav-content'}>
          {mode === 'baseline' ? (
            <BaselinePage key={symbol} symbol={symbol} onReady={onReady} />
          ) : (
            <Suspense fallback={<PageSkeleton />}>
              <OptimizedPage symbol={symbol} onReady={onReady} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
