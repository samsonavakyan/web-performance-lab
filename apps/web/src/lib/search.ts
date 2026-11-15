import type { Instrument } from '../types';

// Smallest edit distance between the query and any part of the text, in one pass over the text.
function matchDistance(text: string, query: string): number {
  let column = Array.from({ length: query.length + 1 }, (_, i) => i);
  let best = column[query.length];
  for (const char of text) {
    const next = [0];
    for (let i = 1; i <= query.length; i++) {
      next[i] = Math.min(column[i] + 1, next[i - 1] + 1, column[i - 1] + (query[i - 1] === char ? 0 : 1));
    }
    column = next;
    best = Math.min(best, column[query.length]);
  }

  return best;
}

// Finds instruments by symbol or company name. Queries of five letters or more tolerate one typo.
export function searchInstruments(items: Instrument[], query: string): Instrument[] {
  const needle = query.toLowerCase().trim();
  if (!needle) return items;

  const maxDistance = needle.length >= 5 ? 1 : 0;

  return items
    .map((item) => ({ item, distance: matchDistance(`${item.symbol} ${item.name}`.toLowerCase(), needle) }))
    .filter((match) => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map((match) => match.item);
}
