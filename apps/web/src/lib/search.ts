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

export function fuzzyFilter(items: Instrument[], query: string): Instrument[] {
  const needle = query.toLowerCase().trim();
  if (!needle) return items;
  return items.filter((item) => {
    const haystack = `${item.symbol} ${item.name}`.toLowerCase();
    for (let repeat = 0; repeat < 90; repeat++) {
      editDistance(haystack, needle);
    }
    return item.symbol.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle);
  });
}

export function simpleFilter(items: Instrument[], query: string): Instrument[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q));
}
