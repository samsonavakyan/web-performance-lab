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

Set CPU throttling to 4x. Type nvda in the watchlist search, clear it and type it again.

</details>
<details><summary>Where to look</summary>

The Performance panel. Record while you type.

</details>
<details><summary>What to notice</summary>

How long each key press takes before the letter shows up. Which functions take the most time in Bottom-Up?

</details>
<details><summary>Solution</summary>

On every key press the search compares the query with every part of every instrument name. That is slow, and the input waits for it. The fix uses a faster match that reads each name once and runs the search with useDeferredValue, so the letter shows up first.

</details>

## 02. Order book

> QA: "On a slower laptop the whole terminal stutters while the order book is open. On the Recent Trades tab it is fine."

<details><summary>Reproduce</summary>

Keep the quote stream running and the Order Book tab open. Set CPU throttling to 4x and record five seconds.

</details>
<details><summary>Where to look</summary>

The Performance panel, Main track.

</details>
<details><summary>What to notice</summary>

Purple Layout blocks inside the script and Forced reflow warnings. Which line causes them?

</details>
<details><summary>Solution</summary>

For each of 160 rows the code changes a bar width and then reads the cell width. Every read after a change makes the browser recalculate the layout on the spot. The fix sets the bar size with transform: scaleX, so the code never measures anything.

</details>

## 03. Watchlist

> Users: "Scrolling the watchlist is jerky, and the terminal feels sluggish while the full list is on screen."

<details><summary>Reproduce</summary>

Clear the search and keep the quote stream running. Scroll to the bottom and back, and record five seconds.

</details>
<details><summary>Where to look</summary>

The Elements panel, then the Performance panel while you scroll.

</details>
<details><summary>What to notice</summary>

How many rows are on the page compared to how many you can see. How long does one quote update take?

</details>
<details><summary>Solution</summary>

The list renders all 2,200 rows and updates them on every quote message. The fix renders only the rows you can see plus a few extra (virtualization).

</details>

## 04. Market bulletin

> Team lead: "Users say the page jumps right when they click, and they open the wrong instrument. Our CLS in field data turned red after we added notices."

<details><summary>Reproduce</summary>

Press Replay bulletin and record at least three seconds without clicking.

</details>
<details><summary>Where to look</summary>

The Performance panel, Layout shifts track. In the Rendering tab, turn on Layout Shift Regions.

</details>
<details><summary>What to notice</summary>

What moves when the notice appears, and the CLS value.

</details>
<details><summary>Solution</summary>

The notice appears above the content with no space kept for it, so everything below jumps down. The fix keeps an empty box of the same height until the notice arrives.

</details>

## 05. Market overview

> Team lead: "The overview strip shows a skeleton for more than a second, though it is only four numbers. On mobile networks it is worse."

<details><summary>Reproduce</summary>

Set Response to Normal and press Reload overview. Then try Unavailable and Invalid data.

</details>
<details><summary>Where to look</summary>

The Network panel. Compare the overview request in both modes.

</details>
<details><summary>What to notice</summary>

The size of the response and how long the server takes to answer (the Timing tab). How much of the response does the strip show?

</details>
<details><summary>Solution</summary>

The strip needs four numbers, but it loads the full overview with a 12,000-row table it never shows, and the server is slow to build it. The fix loads /api/overview/summary, which has only what the strip shows.

</details>

## 06. Chart scanner

> Designer: "The scan marker under the chart stutters whenever the app is busy. On a slower laptop the animation is never smooth."

<details><summary>Reproduce</summary>

Set CPU throttling to 4x and record the moving marker for five seconds.

</details>
<details><summary>Where to look</summary>

The Performance panel with CPU throttling. In the Rendering tab, turn on Paint flashing.

</details>
<details><summary>What to notice</summary>

Does the browser recalculate the layout and repaint on every frame while the marker moves?

</details>
<details><summary>Solution</summary>

The animation changes left, so the browser recalculates the layout and repaints on every frame. The fix animates transform instead, which the browser moves on the GPU without that work.

</details>

## Advanced

Advanced cases open a separate screen. Their lab controls appear in the panel under the open case. Changing the mode starts a fresh run. Back to market returns to the main screen.

### 07. Instrument monitor

> Traders: "In the morning everything is fast. By the end of the day the screen lags and typing a trade note is slow. Reloading the tab helps."

<details><summary>Reproduce</summary>

Reload the browser tab and type a trade note. Press Simulate trading day: it opens 80 instruments one by one. Type a note again.

</details>
<details><summary>Where to look</summary>

The Memory panel. Take a heap snapshot before and after the trading day. In the Elements panel, check the event listeners on window.

</details>
<details><summary>What to notice</summary>

Which objects keep growing, even though the screen shows one chart? How many resize listeners are there?

</details>
<details><summary>Solution</summary>

When the chart is replaced, the old one is never cleaned up. It stays subscribed to prices and window resize and keeps redrawing in the background. The price history cache also grows forever. The fix unsubscribes and destroys the chart when it is removed and keeps only the last 20 histories.

</details>

### 08. Order ticket

> Traders: "When the market is busy, the limit price field lags and sometimes characters disappear. On a quiet market it is fine."

<details><summary>Reproduce</summary>

Set CPU throttling to 4x. Press Start stream and type a limit price in the order ticket.

</details>
<details><summary>Where to look</summary>

The Performance panel while you type during the stream.

</details>
<details><summary>What to notice</summary>

How long each key press waits, and how many components render for one price message.

</details>
<details><summary>Solution</summary>

Prices arrive 120 times a second, and each message renders the whole board again, about 1,900 components. Every price also creates a new number formatter. The fix groups the messages of one frame into one update, lets each cell follow only its own price and reuses one formatter.

</details>

### 09. Instrument switch

> Users: "When I switch instruments, everything disappears and comes back in pieces. Flipping through several in a row, I only see gray placeholders."

<details><summary>Reproduce</summary>

Open the Network panel and set Fast 4G. Switch NVDA, AAPL and MSFT. Press Clear data cache before each run.

</details>
<details><summary>Where to look</summary>

The Network panel, Waterfall column.

</details>
<details><summary>What to notice</summary>

When does each request and JS file start, compared to the click? All together, or one after another?

</details>
<details><summary>Solution</summary>

Each part of the page starts loading only after the part above it has loaded: details first, then the chart and order book, then the news. This is a waterfall. The page also turns into a skeleton on every switch. The fix starts all requests and files at once, even on hover, and keeps the old page on screen until the new one is ready.

</details>

### 10. Trade export

> Back office: "I pressed export for the whole year, the tab froze completely and Chrome offered to close the page."

<details><summary>Reproduce</summary>

Keep CPU and network throttling off. Choose 100,000 trades, press Export CSV and start typing a comment right away. Clear Save file in the panel if you do not want downloads.

</details>
<details><summary>Where to look</summary>

The Performance panel while the export runs and you type.

</details>
<details><summary>What to notice</summary>

The longest task on the Main track and what fills it. Is there a Worker track?

</details>
<details><summary>Solution</summary>

Downloading, parsing and formatting 100,000 rows all happen on the main thread in one go, so the page cannot react to anything. Every row also creates new date and number formatters. The fix moves the work to a Web Worker and reuses the formatters. The worker reports progress, and the export can be cancelled.

</details>

### 11. Live feed

> Users and ops: "After a break the status says online, but the prices are old. After every release the app shows no data for a few seconds, and ops see a spike of connections."

<details><summary>Reproduce</summary>

Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server.

</details>
<details><summary>Where to look</summary>

The Network panel. Filter Socket (WS in older Chrome), open the feed request whose Time is Pending, then the Messages tab. Also watch Server monitoring in this panel.

</details>
<details><summary>What to notice</summary>

What arrives during sleep and what the badge says meanwhile. The seq numbers after Wake up. How often the app tries to reconnect after Restart server.

</details>
<details><summary>Solution</summary>

The app believes the connection works as long as it is open. It does not notice that messages stopped or that some were missed, and it retries every second, so after a restart all users reconnect at the same moment. The fix treats 3 seconds without messages as a lost connection, asks for the missed messages when it reconnects and waits a bit longer, plus a random delay, before each retry.

</details>
