# Performance exercises

Open the terminal at http://localhost:5173 and Chrome DevTools → Performance.

Select one scenario in the **Performance Lab** panel. Record the interaction in Baseline mode, examine the trace, then repeat it in Optimized mode under similar conditions.

For every exercise, try to answer: What feels slow or unstable? Which recording evidence supports the diagnosis? How would you test whether the change helped?

## 01 — Search

Use the watchlist search in both modes. Enter the same query in each recording.

- Does the interaction stay responsive?
- What happens between the input event and the visual update?
- What is the most expensive operation you can find?

## 02 — Watchlist

Keep the quote stream running, scroll the watchlist and record for 5 seconds.

- What work repeats?
- How does scrolling behave?
- Which part of the interface should you investigate first?

## 03 — Order book

Record the updating order book for 5 seconds.

- What is the browser doing between updates?
- Can you identify the expensive part of the work?
- What evidence would confirm your hypothesis?

## 04 — Chart animation

Observe the scanner indicator on the chart and record a few seconds.

- Does the movement look consistent?
- How much work is associated with the animation?
- How would you compare the two implementations?

## 05 — Market bulletin

Click **Replay bulletin** and record the page while the notification appears.

- What changed on the page?
- Can you quantify its effect on the experience?
- Which data in DevTools would you use?

## 06 — Market overview

Click **Reload overview** with each mode selected.

- Where is time spent between starting the request and showing the result?
- What evidence can you collect from Network and Performance?
- What would you investigate next if this happened in production?

## Compare results

Keep the browser, machine, viewport and network settings consistent. Save or describe the recordings and note any differences. Repeat measurements before concluding that one version is faster.
