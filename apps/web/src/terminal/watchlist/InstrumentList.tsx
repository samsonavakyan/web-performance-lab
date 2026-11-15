import { useEffect, useRef, useState } from 'react';
import type { Instrument, Quote } from '../../types';
import { InstrumentRow } from './InstrumentRow';

const ROW_HEIGHT = 55;
const LIST_HEIGHT = 470;
const OVERSCAN = 4;

type Props = {
  items: Instrument[];
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (symbol: string) => void;
  query: string;
};

export function InstrumentList({ items, quotes, selected, onSelect, query }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [query]);

  const first = Math.max(0, Math.min(Math.floor(scrollTop / ROW_HEIGHT), Math.max(0, items.length - 1)) - OVERSCAN);
  const count = Math.ceil(LIST_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
  const visible = items.slice(first, first + count);

  return (
    <div className="watchlist-scroll" ref={scrollRef} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * ROW_HEIGHT, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, width: '100%', transform: `translateY(${first * ROW_HEIGHT}px)` }}>
          {visible.map((item) => (
            <InstrumentRow
              key={item.symbol}
              item={item}
              quote={quotes[item.symbol]}
              selected={selected === item.symbol}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      {!items.length && <div className="empty-state">No instruments found</div>}
    </div>
  );
}
