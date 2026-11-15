import { useMemo, useState } from 'react';
import { ListFilter, Search } from 'lucide-react';
import { InstrumentList, useInstrumentSearch } from '../../lab/variants';
import type { Instrument, Quote } from '../../types';

type Props = {
  instruments: Instrument[];
  quotes: Record<string, Quote>;
  selected: string;
  onSelect: (symbol: string) => void;
};

export function Watchlist({ instruments, quotes, selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'change'>('name');
  const found = useInstrumentSearch(instruments, query);

  const sorted = useMemo(() => {
    if (sort === 'name') return found;
    return [...found].sort((a, b) => (quotes[b.symbol]?.change ?? b.change) - (quotes[a.symbol]?.change ?? a.change));
  }, [found, quotes, sort]);

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
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd>⌕</kbd>
      </div>

      <div className="watchlist-table-head">
        <span>SYMBOL / COMPANY</span>
        <span>LAST</span>
        <span>CHG</span>
      </div>

      <InstrumentList items={sorted} quotes={quotes} selected={selected} onSelect={onSelect} query={query} />

      <div className="watchlist-footer">
        <span className="status-dot" /> <span>Watchlist</span>
        <span>{sorted.length.toLocaleString()} results</span>
      </div>
    </section>
  );
}
