export type AdvancedScenario = 'instrument-monitor' | 'order-ticket' | 'instrument-switch' | 'trade-export' | 'live-feed';
export type Scenario = AdvancedScenario | 'search' | 'watchlist' | 'order-book' | 'scanner' | 'bulletin' | 'overview';
export type Mode = 'baseline' | 'optimized';

export type Case = {
  id: Scenario;
  title: string;
  subtitle: string;
  // Who reports the problem and what they see. Symptoms only, never the cause.
  complaint: { from: string; text: string };
  steps: string;
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
    complaint: {
      from: 'Support ticket',
      text: 'Typing in the watchlist search feels sticky. Letters show up late, and on the office laptops search is almost unusable.',
    },
    steps: 'Set CPU throttling to 4x. Type nvda, clear the field, then type NVDA with spaces before and after it.',
    group: 'Basic',
    target: '.watchlist-panel',
    hasTimings: true,
  },
  {
    id: 'order-book',
    title: 'Order book',
    subtitle: 'Market depth',
    complaint: {
      from: 'QA',
      text: 'On a slower laptop the whole terminal stutters while the order book is open. On the Recent Trades tab it is fine.',
    },
    steps: 'Keep the quote stream running and the Order Book tab open. Set CPU throttling to 4x and record five seconds.',
    group: 'Basic',
    target: '.depth-panel',
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    subtitle: 'Live market list',
    complaint: {
      from: 'Users',
      text: 'Scrolling the watchlist is jerky, and the terminal feels sluggish while the full list is on screen.',
    },
    steps: 'Clear the search and keep the quote stream running. Scroll to the bottom and back, and record five seconds.',
    group: 'Basic',
    target: '.watchlist-panel',
  },
  {
    id: 'bulletin',
    title: 'Market bulletin',
    subtitle: 'Event notification',
    complaint: {
      from: 'Team lead',
      text: 'Users say the page jumps right when they click, and they open the wrong instrument. Our CLS in field data turned red after we added notices.',
    },
    steps: 'Press Replay bulletin and record at least three seconds without clicking.',
    group: 'Basic',
    target: '.bulletin-slot',
  },
  {
    id: 'overview',
    title: 'Market overview',
    subtitle: 'Data refresh',
    complaint: {
      from: 'Team lead',
      text: 'The overview strip shows a skeleton for more than a second, though it is only four numbers. On mobile networks it is worse.',
    },
    steps: 'Set Response to Normal and press Reload overview. Repeat with the same network settings. Then try Unavailable and Invalid data.',
    group: 'Basic',
    target: '.overview-section',
    hasTimings: true,
  },
  {
    id: 'scanner',
    title: 'Chart scanner',
    subtitle: 'Visual activity',
    complaint: {
      from: 'Designer',
      text: 'The scan marker under the chart stutters whenever the app is busy. On a slower laptop the animation is never smooth.',
    },
    steps: 'Set CPU throttling to 4x and record the moving marker for five seconds.',
    group: 'Basic',
    target: '.chart-panel',
  },
  {
    id: 'instrument-monitor',
    title: 'Instrument monitor',
    subtitle: 'Long session',
    complaint: {
      from: 'Traders',
      text: 'In the morning everything is fast. By the end of the day the screen lags and typing a trade note is slow. Reloading the tab helps.',
    },
    steps: 'Reload the browser tab, type a trade note, then press Simulate trading day. It switches 80 instruments one by one. Type a note again.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'order-ticket',
    title: 'Order ticket',
    subtitle: 'Live quotes',
    complaint: {
      from: 'Traders',
      text: 'When the market is busy, the limit price field lags and sometimes characters disappear. On a quiet market it is fine.',
    },
    steps: 'Set CPU throttling to 4x. Press Start stream and type a limit price in the order ticket.',
    group: 'Advanced',
  },
  {
    id: 'instrument-switch',
    title: 'Instrument switch',
    subtitle: 'Navigation',
    complaint: {
      from: 'Users',
      text: 'When I switch instruments, everything disappears and comes back in pieces. Flipping through several in a row, I only see gray placeholders.',
    },
    steps: 'Open Network, Fast 4G is fine. Switch NVDA, AAPL, MSFT. Press Clear data cache before each run.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'trade-export',
    title: 'Trade export',
    subtitle: 'CSV download',
    complaint: {
      from: 'Back office',
      text: 'I pressed export for the whole year, the tab froze completely and Chrome offered to close the page.',
    },
    steps: 'Keep CPU and network throttling off. Choose 100,000 trades, press Export CSV and start typing a comment right away.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'live-feed',
    title: 'Live feed',
    subtitle: 'Connection health',
    complaint: {
      from: 'Users and ops',
      text: 'Users: after a break the status says online, but the prices are old. Ops: after every release the app shows no data for several seconds, and the feed service sees a spike of connections.',
    },
    steps: 'Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server.',
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
