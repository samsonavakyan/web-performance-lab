import { useDeferredValue, useMemo } from 'react';
import { timed } from '../../lab/timings';
import { searchInstruments } from '../../lib/search';
import type { Instrument } from '../../types';

export function useInstrumentSearch(items: Instrument[], query: string) {
  const deferredQuery = useDeferredValue(query);
  return useMemo(
    () =>
      deferredQuery.trim()
        ? timed('search', `search "${deferredQuery.trim()}"`, () => searchInstruments(items, deferredQuery))
        : items,
    [items, deferredQuery],
  );
}
