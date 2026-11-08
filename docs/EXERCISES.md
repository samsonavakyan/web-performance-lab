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

Use the Basic and Advanced tabs to find a case, then press Open case. The open case is highlighted. Baseline/Optimized, Workload and Response settings are in the side panel. Hide the list with Performance Lab to use the full window. Back to market returns to the six cases above. Changing an advanced case's mode starts a fresh run. Workload settings remain selected. The quote stream can stay connected while an advanced case is open.

### 07. Query workspace

Choose a workload. Type `market` quickly, replace it with `energy`, then press Check interaction. Wait for Ready before switching mode. Repeat with the same workload. If needed, use 4x CPU throttling and workload 240.

### 08. Desk preferences

Press Run feed and wait for the sequence to reach 20. Change appearance, then run the feed again. Repeat in the other mode with the same CPU setting.

### 09. Portfolio analysis

Choose a sample count and press Run report. Type in Note while the report runs. Wait for the result, then repeat in the other mode with the same sample count. Compare Calculation and Elapsed for the same sample count. Cancel report stops the current run when available. On a fast machine use 4,000,000 samples and 4x CPU throttling.

### 10. Saved snapshot

Use localhost or HTTPS. Keep the loaded page open throughout this case. Ensure DevTools Application → Service Workers → Bypass for network is unchecked.

1. Select Optimized, open the case and wait for Ready.
2. Set Network to Online. Press Reset snapshot, then Load snapshot. Record its revision and capture time.
3. Set Network to Offline and press Load snapshot again.
4. Switch to Baseline and press Load snapshot while still offline.
5. Switch back to Optimized and repeat. Restore Online and load once more.
6. Press Reset snapshot while online. Set Offline and load again. Restore Online when finished.

Saved values retain their original capture time. Reset snapshot affects this case's saved data only. Reloading the entire application while offline is outside this case. The API and app must be running for online loads.
