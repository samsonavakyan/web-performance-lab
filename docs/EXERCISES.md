# Cases

Open http://localhost:5173. Pick a case in the Performance Lab panel and switch it to Baseline. Keep the other cases on Optimized, so their noise stays out of your traces. Record the same steps in Baseline and Optimized with the same browser, viewport, CPU and network settings. On a fast laptop turn on CPU throttling (4x or 6x).

Each case starts with a complaint: what users or the team report, without the cause. Try to reproduce and find the problem on your own, then open the hints one at a time. The same hints are in the panel.

## Timings

Some cases have a Timings switch in the open case card. It is off by default. When it is on, the case adds User Timing measures to the Timings track of the Performance panel. A measure points at the code that does the work, so try to find the problem without it first.

| Case | Measure |
| --- | --- |
| 01. Search | `search "<query>"`, filtering for one query |
| 05. Market overview | `overview`, from the request to the result |
| 07. Instrument monitor | `quote tick`, one round of price updates for all subscribed charts |
| 09. Instrument switch | `instrument <symbol>`, from the click until every section is on screen |
| 10. Trade export | `trade export`, from the click to the finished file |
| 11. Live feed | `no quotes`, a pause of more than 1.5 s between prices |

In dev React StrictMode runs `useMemo` twice, so the search measure appears twice per query. `npm run preview` has one. The dev build also shows React's own Components and Scheduler tracks, useful for the Watchlist and Order ticket cases.

## 01. Search

> Support ticket: "Typing in the watchlist search feels sticky. Letters show up late, and on the office laptops search is almost unusable."

<details><summary>Reproduce</summary>

Set CPU throttling to 4x. Type nvda, clear the field, then type NVDA with spaces before and after it.

</details>
<details><summary>Where to look</summary>

Performance panel. Record while typing, then look at the Interactions and Main tracks.

</details>
<details><summary>What to notice</summary>

How long each keystroke takes until the next frame, and which functions fill the long tasks in Bottom-Up.

</details>
<details><summary>Where in the code</summary>

src/terminal/watchlist/useInstrumentSearch.baseline.ts, src/lib/search.baseline.ts

</details>
<details><summary>Solution</summary>

The typo-tolerant match compares the query with every substring of every instrument on each keystroke (O(n²·m)), in the same render as the input. The fix finds the best match in one pass (O(n·m)) and filters a useDeferredValue copy of the query, so typing stays responsive and stale queries are skipped.

</details>

## 02. Order book

> QA: "On a slower laptop the whole terminal stutters while the order book is open. On the Recent Trades tab it is fine."

<details><summary>Reproduce</summary>

Keep the quote stream running and the Order Book tab open. Set CPU throttling to 4x and record five seconds.

</details>
<details><summary>Where to look</summary>

Performance panel, Main track, with the quote stream running.

</details>
<details><summary>What to notice</summary>

Purple Layout blocks inside script tasks and the Forced reflow warnings. Which line causes them?

</details>
<details><summary>Where in the code</summary>

src/terminal/order-book/DepthTable.baseline.tsx

</details>
<details><summary>Solution</summary>

On every update the effect writes a bar width, reads the cell width and writes again, row after row. Each read after a write forces a synchronous layout (layout thrashing). The fix sizes the bars with transform: scaleX, so nothing has to be measured.

</details>

## 03. Watchlist

> Users: "Scrolling the watchlist is jerky, and the terminal feels sluggish while the full list is on screen."

<details><summary>Reproduce</summary>

Clear the search and keep the quote stream running. Scroll to the bottom and back, and record five seconds.

</details>
<details><summary>Where to look</summary>

Elements panel for the list, then Performance while scrolling with the stream on.

</details>
<details><summary>What to notice</summary>

How many rows are in the DOM compared to the rows you can see, and how long each quote update takes to render.

</details>
<details><summary>Where in the code</summary>

src/terminal/watchlist/InstrumentList.baseline.tsx

</details>
<details><summary>Solution</summary>

All 2,200 rows are rendered and updated on every quote message. The fix renders only the rows in view plus a small buffer (virtualization).

</details>

## 04. Market bulletin

> Team lead: "Users say the page jumps right when they click, and they open the wrong instrument. Our CLS in field data turned red after we added notices."

<details><summary>Reproduce</summary>

Press Replay bulletin and record at least three seconds without clicking.

</details>
<details><summary>Where to look</summary>

Performance panel, Layout shifts track. In the Rendering drawer, turn on Layout Shift Regions.

</details>
<details><summary>What to notice</summary>

What moves when the notice appears, and the CLS value.

</details>
<details><summary>Where in the code</summary>

src/terminal/chart/Bulletin.baseline.tsx

</details>
<details><summary>Solution</summary>

The notice is inserted above the content without reserved space, so everything below it shifts. The fix keeps a placeholder of the same height until the notice appears.

</details>

## 05. Market overview

> Team lead: "The overview strip shows a skeleton for more than a second, though it is only four numbers. On mobile networks it is worse."

<details><summary>Reproduce</summary>

Set Response to Normal and press Reload overview. Repeat with the same network settings. Then try Unavailable and Invalid data.

</details>
<details><summary>Where to look</summary>

Network panel. Compare the overview request in both modes.

</details>
<details><summary>What to notice</summary>

Response size, and in Timing the time spent waiting for the server. How much of the response does the strip show?

</details>
<details><summary>Where in the code</summary>

src/terminal/overview/MarketOverview.baseline.tsx

</details>
<details><summary>Solution</summary>

The strip loads /api/overview, which is slow and carries a 12,000-row sector table the strip never shows (overfetching). The fix loads /api/overview/summary with only the fields on screen.

</details>

## 06. Chart scanner

> Designer: "The scan marker under the chart stutters whenever the app is busy. On a slower laptop the animation is never smooth."

<details><summary>Reproduce</summary>

Set CPU throttling to 4x and record the moving marker for five seconds.

</details>
<details><summary>Where to look</summary>

Performance panel with CPU throttling. In the Rendering drawer, turn on Paint flashing.

</details>
<details><summary>What to notice</summary>

What the browser does on every frame while the marker moves: layout and paint, or only compositing.

</details>
<details><summary>Where in the code</summary>

src/terminal/chart/ScannerTrack.baseline.tsx and the scanner keyframes in src/styles.css

</details>
<details><summary>Solution</summary>

The marker animates left, which needs layout and paint on the main thread every frame. The fix animates transform, which the compositor handles without the main thread.

</details>

## Advanced

Advanced cases open a separate screen. Their lab controls appear in the panel under the open case. Changing the mode starts a fresh run. Back to market returns to the main screen.

### 07. Instrument monitor

> Traders: "In the morning everything is fast. By the end of the day the screen lags and typing a trade note is slow. Reloading the tab helps."

<details><summary>Reproduce</summary>

Reload the browser tab, type a trade note, then press Simulate trading day. It switches 80 instruments one by one. Type a note again.

</details>
<details><summary>Where to look</summary>

Memory panel: a heap snapshot before and after the trading day. Elements panel, Event Listeners of window.

</details>
<details><summary>What to notice</summary>

In the snapshot comparison, which objects keep growing although the screen shows one chart? How many resize listeners are there?

</details>
<details><summary>Where in the code</summary>

src/workspaces/instrument-monitor/PriceChart.baseline.tsx

</details>
<details><summary>Solution</summary>

The chart effect has no cleanup, so every old chart stays subscribed to the quote feed and to window resize, keeps its canvas and recalculates on every tick. The history cache also grows without limit. The fix unsubscribes and destroys the chart on unmount and keeps an LRU cache of 20 histories.

</details>

### 08. Order ticket

> Traders: "When the market is busy, the limit price field lags and sometimes characters disappear. On a quiet market it is fine."

<details><summary>Reproduce</summary>

Set CPU throttling to 4x. Press Start stream and type a limit price in the order ticket.

</details>
<details><summary>Where to look</summary>

Performance panel while typing during the stream. In a dev build, the Components track.

</details>
<details><summary>What to notice</summary>

How long keystrokes wait, and how many components render for one quote message.

</details>
<details><summary>Where in the code</summary>

src/workspaces/order-desk/Desk.baseline.tsx, src/workspaces/order-desk/quoteStore.ts

</details>
<details><summary>Solution</summary>

Each of 120 messages per second creates a new store state, and the desk reads the whole store, so 1,600 cells and 300 rows render per message. Every price also builds a new Intl.NumberFormat. Updates from useSyncExternalStore are synchronous, so transitions do not help. The fix batches messages per frame, subscribes each cell to its own quote and shares one formatter.

</details>

### 09. Instrument switch

> Users: "When I switch instruments, everything disappears and comes back in pieces. Flipping through several in a row, I only see gray placeholders."

<details><summary>Reproduce</summary>

Open Network, Fast 4G is fine. Switch NVDA, AAPL, MSFT. Press Clear data cache before each run.

</details>
<details><summary>Where to look</summary>

Network panel, Waterfall column, with Fast 4G.

</details>
<details><summary>What to notice</summary>

When each request and JS chunk starts relative to the click. Do they start together or one after another?

</details>
<details><summary>Where in the code</summary>

src/workspaces/instrument-switch/Navigator.baseline.tsx, SidePanel.baseline.tsx, useFetch.ts

</details>
<details><summary>Solution</summary>

Each section fetches its data only after it renders, and it renders only after the previous request finishes: info, then the chart and book chunks and requests, then the news chunk and request (a waterfall). The page is also replaced by a skeleton on every switch. The fix starts every request and chunk at once on click, hover or focus (prefetchInstrument), reads them with use() and keeps the old page on screen during the switch with useTransition.

</details>

### 10. Trade export

> Back office: "I pressed export for the whole year, the tab froze completely and Chrome offered to close the page."

<details><summary>Reproduce</summary>

Keep CPU and network throttling off. Choose 100,000 trades, press Export CSV and start typing a comment right away. Clear Save file in the panel if you do not want downloads.

</details>
<details><summary>Where to look</summary>

Performance panel while the export runs and you type.

</details>
<details><summary>What to notice</summary>

The longest task on the Main track, what fills it in Bottom-Up, and whether a Worker track appears.

</details>
<details><summary>Where in the code</summary>

src/workspaces/trade-export/ExportPanel.baseline.tsx, src/workspaces/trade-export/csv.baseline.ts

</details>
<details><summary>Solution</summary>

Fetching, parsing and formatting 100,000 rows run on the main thread in one task, and every row creates new Intl formatters. The fix moves the work to a Web Worker with shared formatters; it reports progress and can be cancelled.

</details>

### 11. Live feed

> Users and ops: "Users: after a break the status says online, but the prices are old. Ops: after every release the app shows no data for several seconds, and the feed service sees a spike of connections."

<details><summary>Reproduce</summary>

Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server.

</details>
<details><summary>Where to look</summary>

Network panel: filter Socket (WS in older Chrome), open the feed request whose Time is Pending, then the Messages tab. Server monitoring in this panel.

</details>
<details><summary>What to notice</summary>

What arrives during sleep, heartbeats included, and what the badge says meanwhile. The seq numbers after Wake up. The timing of reconnect attempts after Restart server.

</details>
<details><summary>Where in the code</summary>

src/workspaces/live-feed/feedClient.baseline.ts, src/workspaces/live-feed/FeedQuote.baseline.tsx

</details>
<details><summary>Solution</summary>

The client trusts an open socket: it ignores silence, heartbeats included, does not notice gaps in seq, and reconnects every second, so all clients come back in waves. The fix treats 3 s of silence as a dead connection, resumes from the last seq and takes a snapshot on a gap, reconnects with exponential backoff and jitter, and shows how fresh the price is.

</details>
