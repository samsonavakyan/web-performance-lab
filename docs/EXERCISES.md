# Cases

Open http://localhost:5173. Pick one case in the Performance Lab panel. Record the same interaction in Baseline and Optimized using the same browser, viewport, CPU and network settings. Keep other cases on Optimized.

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

## Advanced Lab

Use the Advanced tab, choose Baseline or Optimized, then press Open case. Changing the mode starts a fresh run. Back to market returns to the Basic cases. Repeat each case in both modes with the same CPU setting and data size.

### 07. Instrument monitor

Press Reload page, then Simulate trading day. It switches 80 instruments in 20 seconds. Watch the counters during and after the run.

### 08. Order ticket

Set CPU throttling to 4x. Press Start stream and type a limit price in the order ticket.

### 09. Instrument switch

Switch between instruments and compare Page complete. Clear data cache resets cached data.

### 10. Trade export

Keep CPU throttling off. Choose the number of trades. Clear Save file if you do not want downloads. Press Export CSV and type a comment while it runs.

### 11. Live feed

Wait for the price to update. Press Simulate sleep, wait about 5 seconds, then press Wake up. Then press Restart server. The 40 other users are simulated by the server and reconnect with the selected mode's policy. These controls affect every open tab.
