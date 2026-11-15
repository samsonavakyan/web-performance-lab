export type AdvancedScenario = 'leak' | 'stream' | 'navigation' | 'export' | 'reconnect';
export type Scenario = AdvancedScenario | 'search' | 'watchlist' | 'layout' | 'animation' | 'shift' | 'loading';
export type Mode = 'baseline' | 'optimized';

export type Case = {
  id: Scenario;
  title: string;
  subtitle: string;
  hint: string;
  group: 'Basic' | 'Advanced';
  // Panel that Open case scrolls into view, for Basic cases.
  target?: string;
  // The case adds User Timing measures when Timings is on.
  hasTimings?: boolean;
};

export const CASES: Case[] = [
  {
    id: 'search',
    title: 'Search',
    subtitle: 'Symbol lookup',
    hint: 'Type a query in the watchlist search and compare interactions.',
    group: 'Basic',
    target: '.watchlist-panel',
    hasTimings: true,
  },
  {
    id: 'layout',
    title: 'Order book',
    subtitle: 'Market depth',
    hint: 'Record the updates to bid and ask levels.',
    group: 'Basic',
    target: '.depth-panel',
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    subtitle: 'Live market list',
    hint: 'Keep the feed running, then scroll through instruments.',
    group: 'Basic',
    target: '.watchlist-panel',
  },
  {
    id: 'shift',
    title: 'Market bulletin',
    subtitle: 'Event notification',
    hint: 'Press Replay bulletin and capture the moment it appears.',
    group: 'Basic',
    target: '.bulletin-slot',
  },
  {
    id: 'loading',
    title: 'Market overview',
    subtitle: 'Data refresh',
    hint: 'Press Reload overview and inspect the result.',
    group: 'Basic',
    target: '.overview-section',
    hasTimings: true,
  },
  {
    id: 'animation',
    title: 'Chart scanner',
    subtitle: 'Visual activity',
    hint: 'Record the moving marker on the price chart.',
    group: 'Basic',
    target: '.chart-panel',
  },
  {
    id: 'leak',
    title: 'Instrument monitor',
    subtitle: 'Long session',
    hint: 'A trader keeps this screen open all day and switches instruments. Run a trading day, then type a trade note. Reload the browser tab to start over.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'stream',
    title: 'Order ticket',
    subtitle: 'Live quotes',
    hint: 'Start the stream and type a limit price in the order ticket.',
    group: 'Advanced',
  },
  {
    id: 'navigation',
    title: 'Instrument switch',
    subtitle: 'Navigation',
    hint: 'Each instrument page shows details, price history, order book and news. Switch between instruments.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'export',
    title: 'Trade export',
    subtitle: 'CSV download',
    hint: 'Back office exports every trade for the year as a CSV file. Type a comment while the export runs.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'reconnect',
    title: 'Live feed',
    subtitle: 'Connection health',
    hint: 'NVDA price from the live feed. Use Simulate sleep, Wake up and Restart server.',
    group: 'Advanced',
    hasTimings: true,
  },
];

export const ADVANCED_CASES = CASES.filter((item) => item.group === 'Advanced').map((item) => item.id as AdvancedScenario);

export function isAdvanced(id: string): id is AdvancedScenario {
  return (ADVANCED_CASES as string[]).includes(id);
}

export function caseById(id: Scenario) {
  return CASES.find((item) => item.id === id)!;
}
