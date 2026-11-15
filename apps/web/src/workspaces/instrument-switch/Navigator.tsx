import { lazy, Suspense, use, useState, useTransition } from 'react';
import { SYMBOLS } from './data';
import { loadChartSection, loadSidePanel, prefetchInstrument } from './prefetch';
import { ReadyProvider, useReportReady, useSwitchTiming } from './readiness';
import { InfoView, PageSkeleton, Skeleton } from './views';

// Page sections are split into their own chunks; prefetchInstrument starts loading them early.
const ChartSection = lazy(() => loadChartSection().then((module) => ({ default: module.ChartSection })));
const SidePanel = lazy(() => loadSidePanel().then((module) => ({ default: module.SidePanel })));

function InstrumentPage({ symbol }: { symbol: string }) {
  const data = prefetchInstrument(symbol);
  const info = use(data.info);
  useReportReady('info', true);
  return (
    <div className="nav-page">
      <InfoView info={info} />
      <div className="nav-body">
        <Suspense fallback={<Skeleton label="chart" height={210} />}>
          <ChartSection candles={data.candles} />
        </Suspense>
        <aside>
          <Suspense fallback={<Skeleton label="order book" height={300} />}>
            <SidePanel book={data.book} news={data.news} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

export function Navigator() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  // While the next page is loading, the current one stays on screen and isPending is true.
  const [isPending, startTransition] = useTransition();
  const timing = useSwitchTiming(symbol);

  function navigate(next: string) {
    if (next === symbol) return;
    timing.begin(next);
    prefetchInstrument(next);
    startTransition(() => setSymbol(next));
  }

  return (
    <div className="nav-layout">
      <nav className="nav-list" aria-label="Instruments">
        {SYMBOLS.map((item) => (
          <button
            key={item}
            aria-current={item === symbol ? 'page' : undefined}
            onClick={() => navigate(item)}
            // A user who points at an instrument is likely to open it: start loading now.
            onMouseEnter={() => prefetchInstrument(item)}
            onFocus={() => prefetchInstrument(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className={isPending ? 'nav-content pending' : 'nav-content'}>
        <ReadyProvider value={timing.report}>
          <Suspense fallback={<PageSkeleton />}>
            <InstrumentPage symbol={symbol} />
          </Suspense>
        </ReadyProvider>
      </div>
    </div>
  );
}
