import type { Instrument } from '../types';

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }

  return row[b.length];
}

// Smallest edit distance between the query and any part of the text.
function matchDistance(text: string, query: string): number {
  let best = query.length;
  for (let start = 0; start < text.length; start++) {
    for (let end = start + 1; end <= text.length; end++) {
      best = Math.min(best, editDistance(text.slice(start, end), query));
    }
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
