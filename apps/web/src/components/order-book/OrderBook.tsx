import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { DepthTable } from '../../lab/variants';
import { money } from '../../lib/format';
import type { BookLevel } from '../../types';

type Props = {
  levels: BookLevel[];
  seq: number;
  symbol: string;
};

export function OrderBook({ levels, seq, symbol }: Props) {
  const [tab, setTab] = useState<'book' | 'trades'>('book');

  return (
    <section className="panel depth-panel">
      <div className="panel-heading">
        <div>
          <h2>Order book</h2>
          <p>{symbol} · Level II depth</p>
        </div>
        <Settings2 size={16} className="muted-icon" />
      </div>

      <div className="book-tabs">
        <button className={tab === 'book' ? 'active' : ''} onClick={() => setTab('book')}>
          Order Book
        </button>
        <button className={tab === 'trades' ? 'active' : ''} onClick={() => setTab('trades')}>
          Recent Trades
        </button>
      </div>

      {tab === 'book' ? (
        <>
          <div className="depth-columns">
            <span>BID SIZE</span>
            <span>PRICE (USD)</span>
            <span>ASK SIZE</span>
          </div>
          <DepthTable levels={levels} seq={seq} />
          <div className="spread">
            <span>Spread</span>
            <strong>0.04 USD</strong>
            <span>0.03%</span>
          </div>
        </>
      ) : (
        <div className="trades-list">
          {levels.slice(0, 17).map((level, i) => (
            <div className="trade-row" key={level.id}>
              <span>
                10:{String(42 - i).padStart(2, '0')}:{String(58 - i).padStart(2, '0')}
              </span>
              <strong className={i % 3 === 0 ? 'txt-down' : 'txt-up'}>{money(i % 2 ? level.ask : level.bid)}</strong>
              <span>{(level.askSize / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
