// The only place that knows a component has two implementations. Each case keeps them side by side:
// X.tsx is the fixed version, X.baseline.tsx the one with the problem. Diff the pair to see the fix.
import type { Mode, Scenario } from './cases';
import { useModes } from './modes';
import { variant } from './variant';

import { ExportPanel as ExportPanelBaseline } from '../workspaces/trade-export/ExportPanel.baseline';
import { ExportPanel as ExportPanelOptimized } from '../workspaces/trade-export/ExportPanel';
import { PriceChart as PriceChartBaseline } from '../workspaces/instrument-monitor/PriceChart.baseline';
import { PriceChart as PriceChartOptimized } from '../workspaces/instrument-monitor/PriceChart';
import { Navigator as NavigatorBaseline } from '../workspaces/instrument-switch/Navigator.baseline';
import { Navigator as NavigatorOptimized } from '../workspaces/instrument-switch/Navigator';
import { FeedQuote as FeedQuoteBaseline } from '../workspaces/live-feed/FeedQuote.baseline';
import { FeedQuote as FeedQuoteOptimized } from '../workspaces/live-feed/FeedQuote';
import { Desk as DeskBaseline } from '../workspaces/order-desk/Desk.baseline';
import { Desk as DeskOptimized } from '../workspaces/order-desk/Desk';
import { Bulletin as BulletinBaseline } from '../terminal/chart/Bulletin.baseline';
import { Bulletin as BulletinOptimized } from '../terminal/chart/Bulletin';
import { ScannerTrack as ScannerTrackBaseline } from '../terminal/chart/ScannerTrack.baseline';
import { ScannerTrack as ScannerTrackOptimized } from '../terminal/chart/ScannerTrack';
import { DepthTable as DepthTableBaseline } from '../terminal/order-book/DepthTable.baseline';
import { DepthTable as DepthTableOptimized } from '../terminal/order-book/DepthTable';
import { MarketOverview as MarketOverviewBaseline } from '../terminal/overview/MarketOverview.baseline';
import { MarketOverview as MarketOverviewOptimized } from '../terminal/overview/MarketOverview';
import { InstrumentList as InstrumentListBaseline } from '../terminal/watchlist/InstrumentList.baseline';
import { InstrumentList as InstrumentListOptimized } from '../terminal/watchlist/InstrumentList';
import { useInstrumentSearch as useInstrumentSearchBaseline } from '../terminal/watchlist/useInstrumentSearch.baseline';
import { useInstrumentSearch as useInstrumentSearchOptimized } from '../terminal/watchlist/useInstrumentSearch';

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
export const DepthTable = variant('order-book', { baseline: DepthTableBaseline, optimized: DepthTableOptimized });
export const Bulletin = variant('bulletin', { baseline: BulletinBaseline, optimized: BulletinOptimized });
export const MarketOverview = variant('overview', {
  baseline: MarketOverviewBaseline,
  optimized: MarketOverviewOptimized,
});
export const ScannerTrack = variant('scanner', {
  baseline: ScannerTrackBaseline,
  optimized: ScannerTrackOptimized,
});

export const PriceChart = variant('instrument-monitor', {
  baseline: PriceChartBaseline,
  optimized: PriceChartOptimized,
});
export const Desk = variant('order-ticket', { baseline: DeskBaseline, optimized: DeskOptimized });
export const Navigator = variant('instrument-switch', { baseline: NavigatorBaseline, optimized: NavigatorOptimized });
export const ExportPanel = variant('trade-export', { baseline: ExportPanelBaseline, optimized: ExportPanelOptimized });
export const FeedQuote = variant('live-feed', { baseline: FeedQuoteBaseline, optimized: FeedQuoteOptimized });
