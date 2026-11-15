export type AdvancedScenario = 'instrument-monitor' | 'order-ticket' | 'instrument-switch' | 'trade-export' | 'live-feed';
export type Scenario = AdvancedScenario | 'search' | 'watchlist' | 'order-book' | 'scanner' | 'bulletin' | 'overview';
export type Mode = 'baseline' | 'optimized';

export type Case = {
  id: Scenario;
  title: string;
  subtitle: string;
  // Who reports the problem and what they see. Symptoms only, never the cause.
  complaint: { from: string; text: string };
  // Hints the learner opens one by one, from where to look to the solution.
  steps: string;
  look: string;
  notice: string;
  code: string;
  solution: string;
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
    look: 'Performance panel. Record while typing, then look at the Interactions and Main tracks.',
    notice: 'How long each keystroke takes until the next frame, and which functions fill the long tasks in Bottom-Up.',
    code: 'src/terminal/watchlist/useInstrumentSearch.baseline.ts, src/lib/search.baseline.ts',
    solution:
      'The typo-tolerant match compares the query with every substring of every instrument on each keystroke (O(n²·m)), in the same render as the input. The fix finds the best match in one pass (O(n·m)) and filters a useDeferredValue copy of the query, so typing stays responsive and stale queries are skipped.',
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
    look: 'Performance panel, Main track, with the quote stream running.',
    notice: 'Purple Layout blocks inside script tasks and the Forced reflow warnings. Which line causes them?',
    code: 'src/terminal/order-book/DepthTable.baseline.tsx',
    solution:
      'On every update the effect writes a bar width, reads the cell width and writes again, row after row. Each read after a write forces a synchronous layout (layout thrashing). The fix sizes the bars with transform: scaleX, so nothing has to be measured.',
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
    look: 'Elements panel for the list, then Performance while scrolling with the stream on.',
    notice: 'How many rows are in the DOM compared to the rows you can see, and how long each quote update takes to render.',
    code: 'src/terminal/watchlist/InstrumentList.baseline.tsx',
    solution:
      'All 2,200 rows are rendered and updated on every quote message. The fix renders only the rows in view plus a small buffer (virtualization).',
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
    look: 'Performance panel, Layout shifts track. In the Rendering drawer, turn on Layout Shift Regions.',
    notice: 'What moves when the notice appears, and the CLS value.',
    code: 'src/terminal/chart/Bulletin.baseline.tsx',
    solution:
      'The notice is inserted above the content without reserved space, so everything below it shifts. The fix keeps a placeholder of the same height until the notice appears.',
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
    look: 'Network panel. Compare the overview request in both modes.',
    notice: 'Response size, and in Timing the time spent waiting for the server. How much of the response does the strip show?',
    code: 'src/terminal/overview/MarketOverview.baseline.tsx',
    solution:
      'The strip loads /api/overview, which is slow and carries a 12,000-row sector table the strip never shows (overfetching). The fix loads /api/overview/summary with only the fields on screen.',
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
    look: 'Performance panel with CPU throttling. In the Rendering drawer, turn on Paint flashing.',
    notice: 'What the browser does on every frame while the marker moves: layout and paint, or only compositing.',
    code: 'src/terminal/chart/ScannerTrack.baseline.tsx and the scanner keyframes in src/styles.css',
    solution:
      'The marker animates left, which needs layout and paint on the main thread every frame. The fix animates transform, which the compositor handles without the main thread.',
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
    look: 'Memory panel: a heap snapshot before and after the trading day. Elements panel, Event Listeners of window.',
    notice: 'In the snapshot comparison, which objects keep growing although the screen shows one chart? How many resize listeners are there?',
    code: 'src/workspaces/instrument-monitor/PriceChart.baseline.tsx',
    solution:
      'The chart effect has no cleanup, so every old chart stays subscribed to the quote feed and to window resize, keeps its canvas and recalculates on every tick. The history cache also grows without limit. The fix unsubscribes and destroys the chart on unmount and keeps an LRU cache of 20 histories.',
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
    look: 'Performance panel while typing during the stream. In a dev build, the Components track.',
    notice: 'How long keystrokes wait, and how many components render for one quote message.',
    code: 'src/workspaces/order-desk/Desk.baseline.tsx, src/workspaces/order-desk/quoteStore.ts',
    solution:
      'Each of 120 messages per second creates a new store state, and the desk reads the whole store, so 1,600 cells and 300 rows render per message. Every price also builds a new Intl.NumberFormat. Updates from useSyncExternalStore are synchronous, so transitions do not help. The fix batches messages per frame, subscribes each cell to its own quote and shares one formatter.',
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
    look: 'Network panel, Waterfall column, with Fast 4G.',
    notice: 'When each request and JS chunk starts relative to the click. Do they start together or one after another?',
    code: 'src/workspaces/instrument-switch/Navigator.baseline.tsx, SidePanel.baseline.tsx, useFetch.ts',
    solution:
      'Each section fetches its data only after it renders, and it renders only after the previous request finishes: info, then the chart and book chunks and requests, then the news chunk and request (a waterfall). The page is also replaced by a skeleton on every switch. The fix starts every request and chunk at once on click, hover or focus (prefetchInstrument), reads them with use() and keeps the old page on screen during the switch with useTransition.',
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
    steps: 'Keep CPU and network throttling off. Choose 100,000 trades, press Export CSV and start typing a comment right away. Clear Save file in the panel if you do not want downloads.',
    look: 'Performance panel while the export runs and you type.',
    notice: 'The longest task on the Main track, what fills it in Bottom-Up, and whether a Worker track appears.',
    code: 'src/workspaces/trade-export/ExportPanel.baseline.tsx, src/workspaces/trade-export/csv.baseline.ts',
    solution:
      'Fetching, parsing and formatting 100,000 rows run on the main thread in one task, and every row creates new Intl formatters. The fix moves the work to a Web Worker with shared formatters; it reports progress and can be cancelled.',
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
    look: 'Network panel: filter Socket (WS in older Chrome), open the feed request whose Time is Pending, then the Messages tab. Server monitoring in this panel.',
    notice: 'What arrives during sleep, heartbeats included, and what the badge says meanwhile. The seq numbers after Wake up. The timing of reconnect attempts after Restart server.',
    code: 'src/workspaces/live-feed/feedClient.baseline.ts, src/workspaces/live-feed/FeedQuote.baseline.tsx',
    solution:
      'The client trusts an open socket: it ignores silence, heartbeats included, does not notice gaps in seq, and reconnects every second, so all clients come back in waves. The fix treats 3 s of silence as a dead connection, resumes from the last seq and takes a snapshot on a gap, reconnects with exponential backoff and jitter, and shows how fresh the price is.',
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
