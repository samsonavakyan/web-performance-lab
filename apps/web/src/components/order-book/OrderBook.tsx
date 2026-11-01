import { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { money } from '../../lib/format';
import type { BookLevel, Mode } from '../../types';

const VISIBLE_LEVELS = 56;
const MAX_SIZE = 740;

type Props = {
  levels: BookLevel[];
  seq: number;
  mode: Mode;
  symbol: string;
};

export function OrderBook({ levels, seq, mode, symbol }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'book' | 'trades'>('book');

  useEffect(() => {
    if (mode !== 'baseline' || tab !== 'book' || !root.current) return;
    const rows = root.current.querySelectorAll<HTMLElement>('[data-depth-row]');
    rows.forEach((row, i) => {
      const width = row.getBoundingClientRect().width;
      const bar = row.querySelector<HTMLElement>('[data-depth-bar]');
      if (bar) bar.style.width = `${Math.min(85, (width % 103) / 2 + ((i * 19 + seq) % 60))}%`;
      row.style.paddingLeft = `${((seq + i) % 3) + 9}px`;
    });
  }, [seq, mode, tab]);

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
          <div className="depth-scroll" ref={root}>
            {levels.slice(0, VISIBLE_LEVELS).map((level) => (
              <div className="depth-row" data-depth-row key={level.id}>
                <div className="depth-cell depth-bid">
                  <span
                    className="depth-bar green"
                    data-depth-bar
                    style={mode === 'optimized' ? { transform: `scaleX(${level.bidSize / MAX_SIZE})` } : undefined}
                  />
                  <span>{level.bidSize.toLocaleString()}</span>
                </div>
                <div className="depth-price">{money((level.bid + level.ask) / 2)}</div>
                <div className="depth-cell depth-ask">
                  <span className="depth-bar red" style={{ transform: `scaleX(${level.askSize / MAX_SIZE})` }} />
                  <span>{level.askSize.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
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
