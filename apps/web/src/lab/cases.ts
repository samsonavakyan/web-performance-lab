export type AdvancedScenario =
  'instrument-monitor' | 'order-ticket' | 'instrument-switch' | 'trade-export' | 'live-feed';
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
    steps: 'Set CPU throttling to 4x. Type nvda in the watchlist search, clear it and type it again.',
    look: 'The Performance panel. Record while you type.',
    notice:
      'How long each key press takes before the letter shows up. Which functions take the most time in Bottom-Up?',
    solution:
      'On every key press the search compares the query with every part of every instrument name. That is slow, and the input waits for it. The fix uses a faster match that reads each name once and runs the search with useDeferredValue, so the letter shows up first.',
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
    steps:
      'Keep the quote stream running and the Order Book tab open. Set CPU throttling to 4x and record five seconds.',
    look: 'The Performance panel, Main track.',
    notice: 'Purple Layout blocks inside the script and Forced reflow warnings. Which line causes them?',
    solution:
      'For each of 160 rows the code changes a bar width and then reads the cell width. Every read after a change makes the browser recalculate the layout on the spot. The fix sets the bar size with transform: scaleX, so the code never measures anything.',
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
    steps:
      'Clear the search and keep the quote stream running. Scroll to the bottom and back, and record five seconds.',
    look: 'The Elements panel, then the Performance panel while you scroll.',
    notice: 'How many rows are on the page compared to how many you can see. How long does one quote update take?',
    solution:
      'The list renders all 2,200 rows and updates them on every quote message. The fix renders only the rows you can see plus a few extra (virtualization).',
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
    look: 'The Performance panel, Layout shifts track. In the Rendering tab, turn on Layout Shift Regions.',
    notice: 'What moves when the notice appears, and the CLS value.',
    solution:
      'The notice appears above the content with no space kept for it, so everything below jumps down. The fix keeps an empty box of the same height until the notice arrives.',
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
    steps: 'Set Response to Normal and press Reload overview. Then try Unavailable and Invalid data.',
    look: 'The Network panel. Compare the overview request in both modes.',
    notice:
      'The size of the response and how long the server takes to answer (the Timing tab). How much of the response does the strip show?',
    solution:
      'The strip needs four numbers, but it loads the full overview with a 12,000-row table it never shows, and the server is slow to build it. The fix loads /api/overview/summary, which has only what the strip shows.',
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
    look: 'The Performance panel with CPU throttling. In the Rendering tab, turn on Paint flashing.',
    notice: 'Does the browser recalculate the layout and repaint on every frame while the marker moves?',
    solution:
      'The animation changes left, so the browser recalculates the layout and repaints on every frame. The fix animates transform instead, which the browser moves on the GPU without that work.',
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
    steps:
      'Reload the browser tab and type a trade note. Press Simulate trading day: it opens 80 instruments one by one. Type a note again.',
    look: 'The Memory panel. Take a heap snapshot before and after the trading day. In the Elements panel, check the event listeners on window.',
    notice: 'Which objects keep growing, even though the screen shows one chart? How many resize listeners are there?',
    solution:
      'When the chart is replaced, the old one is never cleaned up. It stays subscribed to prices and window resize and keeps redrawing in the background. The price history cache also grows forever. The fix unsubscribes and destroys the chart when it is removed and keeps only the last 20 histories.',
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
    look: 'The Performance panel while you type during the stream.',
    notice: 'How long each key press waits, and how many components render for one price message.',
    solution:
      'Prices arrive 120 times a second, and each message renders the whole board again, about 1,900 components. Every price also creates a new number formatter. The fix groups the messages of one frame into one update, lets each cell follow only its own price and reuses one formatter.',
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
    steps:
      'Open the Network panel and set Fast 4G. Switch NVDA, AAPL and MSFT. Press Clear data cache before each run.',
    look: 'The Network panel, Waterfall column.',
    notice: 'When does each request and JS file start, compared to the click? All together, or one after another?',
    solution:
      'Each part of the page starts loading only after the part above it has loaded: details first, then the chart and order book, then the news. This is a waterfall. The page also turns into a skeleton on every switch. The fix starts all requests and files at once, even on hover, and keeps the old page on screen until the new one is ready.',
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
    steps:
      'Keep CPU and network throttling off. Choose 100,000 trades, press Export CSV and start typing a comment right away. Clear Save file in the panel if you do not want downloads.',
    look: 'The Performance panel while the export runs and you type.',
    notice: 'The longest task on the Main track and what fills it. Is there a Worker track?',
    solution:
      'Downloading, parsing and formatting 100,000 rows all happen on the main thread in one go, so the page cannot react to anything. Every row also creates new date and number formatters. The fix moves the work to a Web Worker and reuses the formatters. The worker reports progress, and the export can be cancelled.',
    group: 'Advanced',
    hasTimings: true,
  },
  {
    id: 'live-feed',
    title: 'Live feed',
    subtitle: 'Connection health',
    complaint: {
      from: 'Users and ops',
      text: 'After a break the status says online, but the prices are old. After every release the app shows no data for a few seconds, and ops see a spike of connections.',
    },
    steps:
      'Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server.',
    look: 'The Network panel. Filter Socket (WS in older Chrome), open the feed request whose Time is Pending, then the Messages tab. Also watch Server monitoring in this panel.',
    notice:
      'What arrives during sleep and what the badge says meanwhile. The seq numbers after Wake up. How often the app tries to reconnect after Restart server.',
    solution:
      'The app believes the connection works as long as it is open. It does not notice that messages stopped or that some were missed, and it retries every second, so after a restart all users reconnect at the same moment. The fix treats 3 seconds without messages as a lost connection, asks for the missed messages when it reconnects and waits a bit longer, plus a random delay, before each retry.',
    group: 'Advanced',
    hasTimings: true,
  },
];

export const ADVANCED_CASES = CASES.filter((item) => item.group === 'Advanced').map(
  (item) => item.id as AdvancedScenario,
);

export function isAdvanced(id: string): id is AdvancedScenario {
  return (ADVANCED_CASES as string[]).includes(id);
}

export function caseById(id: Scenario) {
  return CASES.find((item) => item.id === id)!;
}
