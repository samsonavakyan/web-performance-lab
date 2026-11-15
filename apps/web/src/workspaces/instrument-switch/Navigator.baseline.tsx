import { lazy, Suspense, useEffect, useState } from 'react';
import { fetchJson, SYMBOLS } from './data';
import type { InstrumentInfo, Section } from './data';
import { useSwitchTiming } from './useSwitchTiming';
import { InfoView, PageSkeleton, Skeleton } from './views';

type Ready = (section: Section) => void;

const ChartSection = lazy(() => import('./ChartSection.baseline').then((module) => ({ default: module.ChartSection })));
const SideSection = lazy(() => import('./SideSection.baseline').then((module) => ({ default: module.SideSection })));

function InstrumentPage({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const [info, setInfo] = useState<InstrumentInfo | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchJson<InstrumentInfo>(`/api/instruments/${symbol}`, controller.signal)
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
          <ChartSection symbol={symbol} onReady={onReady} />
        </Suspense>
        <aside>
          <Suspense fallback={<Skeleton label="order book" height={300} />}>
            <SideSection symbol={symbol} onReady={onReady} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

export function Navigator() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const timing = useSwitchTiming(symbol);

  function navigate(next: string) {
    if (next === symbol) return;
    timing.begin(next);
    setSymbol(next);
  }

  return (
    <div className="nav-layout">
      <nav className="nav-list" aria-label="Instruments">
        {SYMBOLS.map((item) => (
          <button key={item} aria-current={item === symbol ? 'page' : undefined} onClick={() => navigate(item)}>
            {item}
          </button>
        ))}
      </nav>
      <div className="nav-content">
        <InstrumentPage key={symbol} symbol={symbol} onReady={timing.onReady} />
      </div>
    </div>
  );
}
