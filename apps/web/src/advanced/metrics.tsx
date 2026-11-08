import { useCallback, useEffect, useState } from 'react';

type TimingEntry = PerformanceEntry & { interactionId?: number };

// Worst interaction latency seen by the Event Timing API, the same source INP is built from.
export function useWorstInteraction() {
  const [worst, setWorst] = useState(0);
  useEffect(() => {
    if (!PerformanceObserver.supportedEntryTypes?.includes('event')) return;
    const observer = new PerformanceObserver((list) => {
      let max = 0;
      for (const entry of list.getEntries() as TimingEntry[]) if (entry.interactionId) max = Math.max(max, entry.duration);
      if (max) setWorst((current) => Math.max(current, max));
    });
    observer.observe({ type: 'event', durationThreshold: 16 } as PerformanceObserverInit);
    return () => observer.disconnect();
  }, []);
  return { worst, reset: useCallback(() => setWorst(0), []) };
}

// Longest main-thread block: long animation frames where supported, long tasks otherwise.
export function useLongestBlock() {
  const [longest, setLongest] = useState(0);
  useEffect(() => {
    const types = PerformanceObserver.supportedEntryTypes ?? [];
    const type = types.includes('long-animation-frame') ? 'long-animation-frame' : types.includes('longtask') ? 'longtask' : '';
    if (!type) return;
    const observer = new PerformanceObserver((list) => {
      const max = Math.max(...list.getEntries().map((entry) => entry.duration));
      setLongest((current) => Math.max(current, max));
    });
    observer.observe({ type, buffered: false });
    return () => observer.disconnect();
  }, []);
  return { longest, reset: useCallback(() => setLongest(0), []) };
}

export function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className={`metric ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
