import { useSyncExternalStore } from 'react';
import type { Scenario } from './cases';

// User Timing marks are off by default: a mark points at the code to inspect, so the learner turns it on per case.
const STORAGE_KEY = 'marketlab-timings';

function loadTimings(): Set<Scenario> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]') as Scenario[]);
  } catch {
    return new Set();
  }
}

let enabled = loadTimings();
const listeners = new Set<() => void>();

export function setTimings(id: Scenario, isOn: boolean) {
  enabled = new Set(enabled);
  if (isOn) enabled.add(id);
  else enabled.delete(id);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
  } catch {
    /* Storage may be unavailable. */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useTimings() {
  return useSyncExternalStore(subscribe, () => enabled);
}

// Adds a measure to the Timings track when the case has timings on. Call the returned function when the work ends.
export function startTiming(id: Scenario, name: string) {
  if (!enabled.has(id)) return () => {};

  const start = performance.now();

  return () => {
    performance.measure(name, { start, end: performance.now() });
  };
}

export function timed<T>(id: Scenario, name: string, work: () => T): T {
  const end = startTiming(id, name);
  try {
    return work();
  } finally {
    end();
  }
}

export function measureSince(id: Scenario, name: string, start: number) {
  if (enabled.has(id)) performance.measure(name, { start, end: performance.now() });
}
