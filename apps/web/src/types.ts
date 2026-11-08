export type Instrument = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  sparkline: number[];
  id: number;
};
export type Candle = { time: number; open: number; close: number; high: number; low: number; volume: number };
export type BookLevel = { id: number; bid: number; ask: number; bidSize: number; askSize: number };
export type Quote = { symbol: string; price: number; change: number };
export type NewsItem = { id: number; time: string; category: string; title: string; source: string };
export type Overview = { asOf: string; title: string; highlights: Quote[]; extras: unknown[] };
export const ADVANCED_SCENARIOS = ['leak', 'stream', 'navigation', 'export', 'reconnect'] as const;
export type AdvancedScenario = (typeof ADVANCED_SCENARIOS)[number];
export type Scenario = AdvancedScenario | 'search' | 'watchlist' | 'layout' | 'animation' | 'shift' | 'loading';
export type Mode = 'baseline' | 'optimized';
export const SCENARIOS: Array<{ id: Scenario; title: string; subtitle: string; hint: string; area: string }> = [
  {
    id: 'search',
    title: 'Search',
    subtitle: 'Symbol lookup',
    hint: 'Type a query in the watchlist search and compare interactions.',
    area: 'Watchlist',
  },
  {
    id: 'layout',
    title: 'Order book',
    subtitle: 'Market depth',
    hint: 'Record the updates to bid and ask levels.',
    area: 'Order book',
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    subtitle: 'Live market list',
    hint: 'Keep the feed running, then scroll through instruments.',
    area: 'Watchlist',
  },
  {
    id: 'shift',
    title: 'Market bulletin',
    subtitle: 'Event notification',
    hint: 'Press Replay bulletin and capture the moment it appears.',
    area: 'Chart',
  },
  {
    id: 'loading',
    title: 'Market overview',
    subtitle: 'Data refresh',
    hint: 'Press Reload overview and inspect the result.',
    area: 'Overview',
  },
  {
    id: 'animation',
    title: 'Chart scanner',
    subtitle: 'Visual activity',
    hint: 'Record the moving marker on the price chart.',
    area: 'Chart',
  },
  {
    id: 'leak',
    title: 'Instrument monitor',
    subtitle: 'Long session',
    hint: 'Open the case and press Simulate trading day.',
    area: 'Advanced',
  },
  {
    id: 'stream',
    title: 'Order ticket',
    subtitle: 'Live quotes',
    hint: 'Open the case. Start the stream and type a price in the order ticket.',
    area: 'Advanced',
  },
  {
    id: 'navigation',
    title: 'Instrument page',
    subtitle: 'Navigation',
    hint: 'Open the case and switch between instruments.',
    area: 'Advanced',
  },
  {
    id: 'export',
    title: 'Trade export',
    subtitle: 'CSV download',
    hint: 'Open the case. Export trades and type a comment while the export runs.',
    area: 'Advanced',
  },
  {
    id: 'reconnect',
    title: 'Live feed',
    subtitle: 'Connection health',
    hint: 'Open the case. Use Simulate sleep, Wake up and Restart server.',
    area: 'Advanced',
  },
];
