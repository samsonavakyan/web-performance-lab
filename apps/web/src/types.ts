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
export type Scenario = 'search' | 'watchlist' | 'layout' | 'animation' | 'shift' | 'loading';
export type Mode = 'baseline' | 'optimized';
export const SCENARIOS: Array<{ id: Scenario; title: string; subtitle: string; hint: string; area: string }> = [
  { id: 'search', title: 'Search', subtitle: 'Symbol lookup', hint: 'Type a query in the watchlist search and compare interactions.', area: 'Watchlist' },
  { id: 'watchlist', title: 'Watchlist', subtitle: 'Live market list', hint: 'Keep the feed running, then scroll through instruments.', area: 'Watchlist' },
  { id: 'layout', title: 'Order book', subtitle: 'Market depth', hint: 'Record the updates to bid and ask levels.', area: 'Order book' },
  { id: 'animation', title: 'Chart scanner', subtitle: 'Visual activity', hint: 'Record the moving marker on the price chart.', area: 'Chart' },
  { id: 'shift', title: 'Market bulletin', subtitle: 'Event notification', hint: 'Press Replay bulletin and capture the moment it appears.', area: 'Chart' },
  { id: 'loading', title: 'Market overview', subtitle: 'Data refresh', hint: 'Press Reload overview and inspect the result.', area: 'Overview' },
];
