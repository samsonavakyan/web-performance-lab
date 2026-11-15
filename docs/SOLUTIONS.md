# Solutions

For the mentor. Show a case after the learner has found and proved the problem in DevTools.

Each case has two implementations side by side: `X.baseline.tsx` has the problem, `X.tsx` has the fix. The app does not know which one runs. `apps/web/src/lab/variants.ts` picks it by the case mode. Diff a pair to walk through the fix.

```bash
git diff --no-index apps/web/src/lib/search.baseline.ts apps/web/src/lib/search.ts
```

## 01. Search

`lib/search.baseline.ts`, `terminal/watchlist/useInstrumentSearch.baseline.ts`

The typo-tolerant match compares the query with every substring of every instrument, so one keystroke costs O(n² · m) per row and blocks input. The fix finds the best match in one pass over the text (O(n · m)) and filters on a deferred query, so typing stays responsive and stale keystrokes are skipped.

## 02. Order book

`terminal/order-book/DepthTable.baseline.tsx`

On every book update the effect writes a bar width, reads the cell width, then writes again, row after row. Each read after a write forces a synchronous layout (layout thrashing). The fix sizes the bars with `transform: scaleX`, so there is nothing to measure.

## 03. Watchlist

`terminal/watchlist/InstrumentList.baseline.tsx`

All 2,200 rows are rendered and updated on every quote message. The fix renders only the rows in view plus a small buffer (virtualization).

## 04. Market bulletin

`terminal/chart/Bulletin.baseline.tsx`

The bulletin is inserted above the workspace without reserved space, so the content below jumps (layout shift, CLS). The fix keeps a placeholder of the same height until the bulletin appears.

## 05. Market overview

`terminal/overview/MarketOverview.baseline.tsx`

The strip loads `/api/overview`, which is slow and carries a 12,000-row sector table the strip never shows. The fix loads `/api/overview/summary` with only the visible fields.

## 06. Chart scanner

`terminal/chart/ScannerTrack.baseline.tsx`

The marker animates `left`, which needs layout and paint every frame on the main thread. The fix animates `transform`, which the compositor handles.

## 07. Instrument monitor

`workspaces/instrument-monitor/PriceChart.baseline.tsx`

The chart effect has no cleanup. Every chart stays subscribed to the quote feed and keeps its canvas and `resize` listener. The history cache also grows without limit. Old charts keep recalculating on every tick, so the page slows down during the day. The fix unsubscribes and destroys the chart on unmount and keeps an LRU cache of 20 histories.

## 08. Order ticket

`workspaces/order-desk/Desk.baseline.tsx`

Each of 120 messages per second updates the store, and the whole desk subscribes to the whole store, so 1,600 cells and 300 rows rerender per message and a new `Intl.NumberFormat` is built per price. The fix batches the messages of one frame into one update, subscribes each cell to its own quote and shares one formatter.

## 09. Instrument switch

`workspaces/instrument-switch/Navigator.baseline.tsx`, `ChartSection.baseline.tsx`, `SidePanel.baseline.tsx`, `NewsFeed.baseline.tsx`

Requests and code chunks load one after another. Page info comes first, then the chart and order book code and data, then the news code and data. This is a waterfall. The page is replaced by a skeleton on every switch. The fix starts all requests and chunks at once, also on hover and focus, and keeps the old page until the new one is ready (`useTransition`).

## 10. Trade export

`workspaces/trade-export/ExportPanel.baseline.tsx`, `csv.baseline.ts`

Fetching, parsing and formatting the CSV run on the main thread, and every row builds new `Intl` formatters. The fix moves the work to a Worker with shared formatters. The worker reports progress, and the export can be cancelled.

## 11. Live feed

`workspaces/live-feed/feedClient.baseline.ts`, `FeedQuote.baseline.tsx`

- A silent connection after sleep goes unnoticed. The socket stays open, and the badge says Connected while the price is frozen. The fix treats 3 s without any message, heartbeats included, as a dead connection.
- Messages sent during the outage are lost. The fix resumes from the last `seq` and takes a snapshot when it sees a gap.
- All clients reconnect after a fixed 1 s, so a restart produces waves of connections. The fix uses exponential backoff with jitter.
- The fix shows how fresh the price is, not only whether the socket is open.
