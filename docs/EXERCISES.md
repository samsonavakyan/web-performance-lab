# Exercises

Open http://localhost:5173 and DevTools → Performance.

Pick a scenario in the Performance Lab panel. Record the interaction in Baseline, look at the trace, then record the same thing in Optimized.

For each one, try to answer three things. What feels slow or jumpy? What in the recording proves it? How would you check that a fix helped?

## 01. Search

Type the same query into the watchlist search in both modes.

- Does the input keep up with typing?
- What happens between the key press and the screen update?
- What is the most expensive call you can find?

## 02. Watchlist

Leave the quote stream running, scroll the watchlist and record for 5 seconds.

- What work repeats?
- How does scrolling feel?
- Where would you look first?

## 03. Order book

Record the order book for 5 seconds while it updates.

- What does the browser do on each update?
- Which part of that work is expensive?
- What would confirm your guess?

## 04. Chart scanner

Watch the moving marker under the chart and record a few seconds.

- Does it move smoothly?
- How much work does each frame take?
- How would you compare the two versions?

## 05. Market bulletin

Click Replay bulletin and record while the notice appears.

- What changed on the page?
- Can you put a number on it?
- Which DevTools data would you use?

## 06. Market overview

Click Reload overview in each mode.

- Where does the time go between the request and the result on screen?
- What do Network and Performance show?
- What would you check next if this happened in production?

## Comparing

Use the same browser, window size, throttling and network settings for both modes. Write down what you saw. One recording is not a benchmark.
