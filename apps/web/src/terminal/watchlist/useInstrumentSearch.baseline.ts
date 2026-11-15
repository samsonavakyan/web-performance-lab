import { useMemo } from 'react';
import { timed } from '../../lab/timings';
import { searchInstruments } from '../../lib/search.baseline';
import type { Instrument } from '../../types';

export function useInstrumentSearch(items: Instrument[], query: string) {
  return useMemo(
    () => (query.trim() ? timed('search', `search "${query.trim()}"`, () => searchInstruments(items, query)) : items),
    [items, query],
  );
}
