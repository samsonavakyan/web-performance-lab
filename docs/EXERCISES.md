# Cases

Open http://localhost:5173. Pick one case in the Performance Lab panel. Record the same interaction in Baseline and Optimized using the same browser, viewport, CPU and network settings. Keep other cases on Optimized.

## Timings

Some cases have a Timings button under the mode switch. It is off by default. When it is on, the case adds User Timing measures to the Timings track of the Performance panel. A measure points at the code that does the work, so try to find the problem without it first.

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

Type `nvda`, clear the field, then type `  NVDA  ` in the watchlist search. Repeat in the other mode.

## 02. Order book

Leave the quote stream running and the Order Book tab open. Record five seconds in each mode.

## 03. Watchlist

Clear the search. Leave the quote stream running, scroll to the bottom and back, and record five seconds in each mode.

## 04. Market bulletin

Press Replay bulletin and record at least three seconds without clicking elsewhere. Repeat in the other mode.

## 05. Market overview

In the side panel, set Response to Normal and press Reload overview. Repeat in the other mode with the same network settings. Try Unavailable and Invalid data, then return to Normal and reload. Change modes while a request is pending and wait for the result.

## 06. Chart scanner

Record the moving marker under the chart for five seconds in each mode.

## Advanced

Use the Advanced tab, choose Baseline or Optimized, then press Open case. Controls that simulate load or failures appear in the side panel under the open case. The app area shows only the product. Use Chrome DevTools for every measurement. Changing the mode starts a fresh run. Back to market returns to the Basic cases. Repeat each case in both modes with the same CPU setting and data size.

### 07. Instrument monitor

Reload the browser tab, then press Simulate trading day. It goes through 80 instruments one by one. Type a trade note before and after the run.

### 08. Order ticket

Set CPU throttling to 4x. Press Start stream and type a limit price in the order ticket.

### 09. Instrument switch

Switch between instruments. Clear data cache resets cached data.

### 10. Trade export

Keep CPU throttling off. Choose the number of trades. Clear Save file if you do not want downloads. Press Export CSV and type a comment while it runs.

### 11. Live feed

Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server. The 40 other users are simulated by the server and reconnect with the selected mode's policy. These controls affect every open tab.

The problem is in how the client handles the connection, not in CPU work, so start in Network: filter WS, open the `feed` request and watch the Messages tab, then look at the reconnect requests after Restart server. Server monitoring in the side panel shows the same from the server side. For a timeline in Performance, turn on Timings.
