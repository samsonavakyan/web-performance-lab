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
export type AdvancedScenario = 'scheduling' | 'context' | 'computation' | 'offline';
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
    id: 'scheduling',
    title: 'Query workspace',
    subtitle: 'Interactive results',
    hint: 'Open the case. Type market quickly, then change the query. Repeat with the same workload.',
    area: 'Advanced',
  },
  {
    id: 'context',
    title: 'Desk preferences',
    subtitle: 'Live desk',
    hint: 'Open the case. Run the feed, then change the appearance.',
    area: 'Advanced',
  },
  {
    id: 'computation',
    title: 'Portfolio analysis',
    subtitle: 'Batch report',
    hint: 'Open the case. Run a report and type in the note field while it runs.',
    area: 'Advanced',
  },
  {
    id: 'offline',
    title: 'Saved snapshot',
    subtitle: 'Data access',
    hint: 'Open the case. Load online, go offline in DevTools, and load again in each mode.',
    area: 'Advanced',
  },
];
