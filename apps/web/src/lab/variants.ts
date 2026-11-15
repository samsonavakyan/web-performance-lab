// The only place that knows a component has two implementations. Each case keeps them side by side:
// X.tsx is the fixed version, X.baseline.tsx the one with the problem. Diff the pair to see the fix.
import type { Mode, Scenario } from './cases';
import { useModes } from './modes';
import { variant } from './variant';

import { ExportPanel as ExportPanelBaseline } from '../advanced/export/ExportPanel.baseline';
import { ExportPanel as ExportPanelOptimized } from '../advanced/export/ExportPanel';
import { PriceChart as PriceChartBaseline } from '../advanced/leak/PriceChart.baseline';
import { PriceChart as PriceChartOptimized } from '../advanced/leak/PriceChart';
import { Navigator as NavigatorBaseline } from '../advanced/navigation/Navigator.baseline';
import { Navigator as NavigatorOptimized } from '../advanced/navigation/Navigator';
import { FeedQuote as FeedQuoteBaseline } from '../advanced/reconnect/FeedQuote.baseline';
import { FeedQuote as FeedQuoteOptimized } from '../advanced/reconnect/FeedQuote';
import { Desk as DeskBaseline } from '../advanced/stream/Desk.baseline';
import { Desk as DeskOptimized } from '../advanced/stream/Desk';
import { Bulletin as BulletinBaseline } from '../components/chart/Bulletin.baseline';
import { Bulletin as BulletinOptimized } from '../components/chart/Bulletin';
import { ScannerTrack as ScannerTrackBaseline } from '../components/chart/ScannerTrack.baseline';
import { ScannerTrack as ScannerTrackOptimized } from '../components/chart/ScannerTrack';
import { DepthTable as DepthTableBaseline } from '../components/order-book/DepthTable.baseline';
import { DepthTable as DepthTableOptimized } from '../components/order-book/DepthTable';
import { MarketOverview as MarketOverviewBaseline } from '../components/overview/MarketOverview.baseline';
import { MarketOverview as MarketOverviewOptimized } from '../components/overview/MarketOverview';
import { InstrumentList as InstrumentListBaseline } from '../components/watchlist/InstrumentList.baseline';
import { InstrumentList as InstrumentListOptimized } from '../components/watchlist/InstrumentList';
import { useInstrumentSearch as useInstrumentSearchBaseline } from '../components/watchlist/useInstrumentSearch.baseline';
import { useInstrumentSearch as useInstrumentSearchOptimized } from '../components/watchlist/useInstrumentSearch';

// A hook cannot be swapped inside a mounted component, so the caller is remounted on a mode change (see App).
function variantHook<A extends unknown[], R>(id: Scenario, implementations: Record<Mode, (...args: A) => R>) {
  return (...args: A): R => implementations[useModes()[id]](...args);
}

export const useInstrumentSearch = variantHook('search', {
  baseline: useInstrumentSearchBaseline,
  optimized: useInstrumentSearchOptimized,
});
export const InstrumentList = variant('watchlist', {
  baseline: InstrumentListBaseline,
  optimized: InstrumentListOptimized,
});
export const DepthTable = variant('layout', { baseline: DepthTableBaseline, optimized: DepthTableOptimized });
export const Bulletin = variant('shift', { baseline: BulletinBaseline, optimized: BulletinOptimized });
export const MarketOverview = variant('loading', {
  baseline: MarketOverviewBaseline,
  optimized: MarketOverviewOptimized,
});
export const ScannerTrack = variant('animation', {
  baseline: ScannerTrackBaseline,
  optimized: ScannerTrackOptimized,
});

export const PriceChart = variant('leak', { baseline: PriceChartBaseline, optimized: PriceChartOptimized });
export const Desk = variant('stream', { baseline: DeskBaseline, optimized: DeskOptimized });
export const Navigator = variant('navigation', { baseline: NavigatorBaseline, optimized: NavigatorOptimized });
export const ExportPanel = variant('export', { baseline: ExportPanelBaseline, optimized: ExportPanelOptimized });
export const FeedQuote = variant('reconnect', { baseline: FeedQuoteBaseline, optimized: FeedQuoteOptimized });
