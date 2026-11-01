import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react';
import { money, signed } from '../../lib/format';
import type { Candle, Instrument, Mode } from '../../types';
import { CandlestickChart } from './CandlestickChart';

const INTERVALS = ['1D', '1W', '1M'];

type Props = {
  symbol: string;
  instrument?: Instrument;
  candles: Candle[];
  price: number;
  change: number;
  animationMode: Mode;
};

export function ChartPanel({ symbol, instrument, candles, price, change, animationMode }: Props) {
  const [interval, setInterval] = useState('1W');
  const [favorite, setFavorite] = useState(false);

  return (
    <section className="panel chart-panel">
      <div className="chart-header">
        <div className="chart-symbol">
          <span className="chart-symbol-icon">{symbol.slice(0, 2)}</span>
          <div>
            <h2>
              {instrument?.name ?? symbol} <ChevronDown size={15} />
            </h2>
            <p>NASDAQ · USD</p>
          </div>
          <button
            className={`icon-button ${favorite ? 'is-favorite' : ''}`}
            onClick={() => setFavorite((v) => !v)}
            title="Toggle favorite"
          >
            <Star size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="chart-actions">
          <span className="live-tag">
            <span className="status-dot" /> LIVE
          </span>
          <div className="intervals">
            {INTERVALS.map((value) => (
              <button key={value} onClick={() => setInterval(value)} className={interval === value ? 'active' : ''}>
                {value}
              </button>
            ))}
          </div>
          <SlidersHorizontal size={16} className="muted-icon" />
        </div>
      </div>

      <CandlestickChart candles={candles} symbol={symbol} mode={animationMode} interval={interval} change={change} />

      <div className="chart-bottom">
        <div>
          <span>MARKET PRICE</span>
          <strong>{money(price)} USD</strong>
        </div>
        <div>
          <span>24H CHANGE</span>
          <strong className={change >= 0 ? 'txt-up' : 'txt-down'}>{signed(change)}</strong>
        </div>
        <div>
          <span>VOLUME (24H)</span>
          <strong>{((instrument?.volume ?? 0) / 1000000).toFixed(2)}M</strong>
        </div>
        <div>
          <span>MARKET STATUS</span>
          <strong className="txt-up">Open</strong>
        </div>
      </div>
    </section>
  );
}
