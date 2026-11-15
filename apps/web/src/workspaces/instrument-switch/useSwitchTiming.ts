import { useCallback, useMemo, useRef } from 'react';
import { startTiming } from '../../lab/timings';
import type { Section } from './data';

const SECTIONS = 4;

// Measures a switch from the click until every section of the new instrument is on screen.
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

  const onReady = useMemo(
    () => (section: Section) => {
      if (symbol !== target.current || ready.current.has(section)) return;
      ready.current.add(section);
      if (ready.current.size === SECTIONS) end.current?.();
    },
    [symbol],
  );

  return { begin, onReady };
}
