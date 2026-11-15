import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { startTiming } from '../../lab/timings';

// Lab instrumentation: each page section reports when it is on screen, and a switch is measured
// from the click until all sections of the new instrument have reported.
export type Section = 'info' | 'chart' | 'book' | 'news';
const SECTIONS = 4;

const ReadyContext = createContext<(section: Section) => void>(() => {});
export const ReadyProvider = ReadyContext.Provider;

export function useReportReady(section: Section, isReady: boolean) {
  const report = useContext(ReadyContext);

  useEffect(() => {
    if (isReady) report(section);
  }, [isReady, report, section]);
}

export function useSwitchTiming(symbol: string) {
  const target = useRef(symbol);
  const ready = useRef(new Set<Section>());
  const end = useRef<(() => void) | null>(null);
  end.current ??= startTiming('instrument-switch', `instrument ${symbol}`);

  const begin = useCallback((next: string) => {
    target.current = next;
    ready.current = new Set();
    end.current = startTiming('instrument-switch', `instrument ${next}`);
  }, []);

  const report = useCallback(
    (section: Section) => {
      if (symbol !== target.current || ready.current.has(section)) return;

      ready.current.add(section);
      if (ready.current.size === SECTIONS) end.current?.();
    },
    [symbol],
  );

  return { begin, report };
}
