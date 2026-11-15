import { lazy, Suspense, useState } from 'react';
import { instrumentApi, SYMBOLS } from './data';
import type { InstrumentInfo } from './data';
import { ReadyProvider, useReportReady, useSwitchTiming } from './readiness';
import { useFetch } from './useFetch';
import { InfoView, PageSkeleton, Skeleton } from './views';

// Page sections are split into their own chunks.
const ChartSection = lazy(() => import('./ChartSection.baseline').then((module) => ({ default: module.ChartSection })));
const SidePanel = lazy(() => import('./SidePanel.baseline').then((module) => ({ default: module.SidePanel })));

function InstrumentPage({ symbol }: { symbol: string }) {
  const info = useFetch<InstrumentInfo>(instrumentApi.info(symbol));

  useReportReady('info', info !== null);
  if (!info) return <PageSkeleton />;

  return (
    <div className="nav-page">
      <InfoView info={info} />
      <div className="nav-body">
        <Suspense fallback={<Skeleton label="chart" height={210} />}>
          <ChartSection symbol={symbol} />
        </Suspense>
        <aside>
          <Suspense fallback={<Skeleton label="order book" height={300} />}>
            <SidePanel symbol={symbol} />
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
        <ReadyProvider value={timing.report}>
          {/* key: a new instrument gets a fresh page */}
          <InstrumentPage key={symbol} symbol={symbol} />
        </ReadyProvider>
      </div>
    </div>
  );
}
