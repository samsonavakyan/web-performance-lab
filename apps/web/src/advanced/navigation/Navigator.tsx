import { lazy, Suspense, use, useEffect, useState, useTransition } from 'react';
import { loadChartCode, loadSideCode, preloadInstrument, SYMBOLS } from './data';
import type { Section } from './data';
import { useSwitchTiming } from './useSwitchTiming';
import { InfoView, PageSkeleton, Skeleton } from './views';

type Ready = (section: Section) => void;

const ChartSection = lazy(() => loadChartCode().then((module) => ({ default: module.ChartSection })));
const SideSection = lazy(() => loadSideCode().then((module) => ({ default: module.SideSection })));

function InstrumentPage({ symbol, onReady }: { symbol: string; onReady: Ready }) {
  const resources = preloadInstrument(symbol);
  const info = use(resources.info);
  useEffect(() => onReady('info'), [info, onReady]);
  return (
    <div className="nav-page">
      <InfoView info={info} />
      <div className="nav-body">
        <Suspense fallback={<Skeleton label="chart" height={210} />}>
          <ChartSection history={resources.history} onReady={onReady} />
        </Suspense>
        <aside>
          <Suspense fallback={<Skeleton label="order book" height={300} />}>
            <SideSection book={resources.book} news={resources.news} onReady={onReady} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

export function Navigator() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [isPending, startTransition] = useTransition();
  const timing = useSwitchTiming(symbol);

  function navigate(next: string) {
    if (next === symbol) return;
    timing.begin(next);
    preloadInstrument(next);
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
            onMouseEnter={() => preloadInstrument(item)}
            onFocus={() => preloadInstrument(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className={isPending ? 'nav-content pending' : 'nav-content'}>
        <Suspense fallback={<PageSkeleton />}>
          <InstrumentPage symbol={symbol} onReady={timing.onReady} />
        </Suspense>
      </div>
    </div>
  );
}
