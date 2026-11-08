import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ListFilter, Search } from 'lucide-react';
import { useModes } from '../../lab/modes';
import { fuzzyFilter, simpleFilter } from '../../lib/search';
import type { Instrument, Mode, Quote } from '../../types';
import { InstrumentRow } from './InstrumentRow';

const ROW_HEIGHT = 55;
const LIST_HEIGHT = 470;

type Props = {
  instruments: Instrument[];
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (symbol: string) => void;
  mode: Mode;
};

export function Watchlist({ instruments, quotes, selected, onSelect, mode }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'change'>('name');
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [query, mode]);
  const deferredQuery = useDeferredValue(query);
  const searchMode = useModes().search;

  const onSearch = (next: string) => {
    setQuery(next);
  };

  const filtered = useMemo(() => {
    const base = searchMode === 'baseline' ? fuzzyFilter(instruments, query) : simpleFilter(instruments, deferredQuery);
    if (sort === 'change') {
      return [...base].sort((a, b) => (quotes[b.symbol]?.change ?? b.change) - (quotes[a.symbol]?.change ?? a.change));
    }
    return base;
  }, [deferredQuery, instruments, quotes, searchMode, query, sort]);

  const first = Math.max(0, Math.min(Math.floor(scrollTop / ROW_HEIGHT), Math.max(0, filtered.length - 1)) - 4);
  const count = Math.ceil(LIST_HEIGHT / ROW_HEIGHT) + 8;
  const visible = mode === 'optimized' ? filtered.slice(first, first + count) : filtered;

  const rows = visible.map((item) => (
    <InstrumentRow
      key={item.symbol}
      item={item}
      quote={quotes[item.symbol]}
      selected={selected === item.symbol}
      onSelect={onSelect}
    />
  ));

  return (
    <section className="panel watchlist-panel">
      <div className="panel-heading watchlist-heading">
        <div>
          <h2>Watchlist</h2>
          <p>{instruments.length.toLocaleString()} symbols</p>
        </div>
        <button
          className="icon-button"
          title="Sort by daily change"
          onClick={() => setSort((v) => (v === 'name' ? 'change' : 'name'))}
        >
          <ListFilter size={15} />
        </button>
      </div>

      <div className="search-field">
        <Search size={16} />
        <input
          aria-label="Search symbols"
          placeholder="Search symbol or company"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        <kbd>⌕</kbd>
      </div>

      <div className="watchlist-table-head">
        <span>SYMBOL / COMPANY</span>
        <span>LAST</span>
        <span>CHG</span>
      </div>

      <div className="watchlist-scroll" ref={scrollRef} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        {mode === 'optimized' ? (
          <div style={{ height: filtered.length * ROW_HEIGHT, position: 'relative' }}>
            <div
              style={{ position: 'absolute', top: 0, width: '100%', transform: `translateY(${first * ROW_HEIGHT}px)` }}
            >
              {rows}
            </div>
          </div>
        ) : (
          rows
        )}
        {!filtered.length && <div className="empty-state">No instruments found</div>}
      </div>

      <div className="watchlist-footer">
        <span className="status-dot" /> <span>Watchlist</span>
        <span>{filtered.length.toLocaleString()} results</span>
      </div>
    </section>
  );
}
