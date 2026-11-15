import { useEffect, useRef } from 'react';
import type { Instrument, Quote } from '../../types';
import { InstrumentRow } from './InstrumentRow';

type Props = {
  items: Instrument[];
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (symbol: string) => void;
  query: string;
};

export function InstrumentList({ items, quotes, selected, onSelect, query }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [query]);

  return (
    <div className="watchlist-scroll" ref={scrollRef}>
      {items.map((item) => (
        <InstrumentRow
          key={item.symbol}
          item={item}
          quote={quotes[item.symbol]}
          selected={selected === item.symbol}
          onSelect={onSelect}
        />
      ))}
      {!items.length && <div className="empty-state">No instruments found</div>}
    </div>
  );
}
