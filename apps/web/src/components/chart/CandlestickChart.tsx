import { ArrowUpRight } from 'lucide-react';
import { money, signed } from '../../lib/format';
import type { Candle, Mode } from '../../types';

const WIDTH = 900;
const HEIGHT = 345;
const LEFT = 28;
const TOP = 27;
const PLOT_WIDTH = 825;
const PLOT_HEIGHT = 233;

type Props = {
  candles: Candle[];
  symbol: string;
  mode: Mode;
  interval: string;
  change: number;
};

export function CandlestickChart({ candles, symbol, mode, interval, change }: Props) {
  const view = interval === '1D' ? candles.slice(-55) : interval === '1W' ? candles.slice(-100) : candles;
  const high = (view.length ? Math.max(...view.map((c) => c.high)) : 1) * 1.003;
  const low = (view.length ? Math.min(...view.map((c) => c.low)) : 0) * 0.997;
  const valueY = (v: number) => TOP + ((high - v) / (high - low)) * PLOT_HEIGHT;
  const step = PLOT_WIDTH / Math.max(view.length, 1);
  const current = view[view.length - 1];
  const maxVolume = Math.max(...view.map((c) => c.volume), 1);

  return (
    <div className="chart-wrap">
      <div className="chart-info">
        <div className="small-label">
          {symbol} / USD <span>•</span> LIVE MARKET
        </div>
        <div className="chart-number">
          {current ? money(current.close) : '—'}
          <span className={change >= 0 ? 'txt-up' : 'txt-down'}>
            {signed(change)} <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="ohlc">
          O <b>{money(current?.open ?? 0)}</b> &nbsp; H <b>{money(current?.high ?? 0)}</b> &nbsp; L{' '}
          <b>{money(current?.low ?? 0)}</b> &nbsp; C <b>{money(current?.close ?? 0)}</b>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="candle-svg" role="img" aria-label={`${symbol} price chart`}>
        {Array.from({ length: 6 }, (_, i) => {
          const y = TOP + (i * PLOT_HEIGHT) / 5;
          const price = high - (i / 5) * (high - low);
          return (
            <g key={i}>
              <line x1={LEFT} y1={y} x2="875" y2={y} className="grid-line" />
              <text x="880" y={y + 4} className="axis-label">
                {money(price)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const x = LEFT + i * (PLOT_WIDTH / 8);
          return (
            <g key={i}>
              <line x1={x} y1={TOP} x2={x} y2="320" className="grid-line" />
              <text x={x} y="335" textAnchor="middle" className="axis-label">
                {String(8 + i).padStart(2, '0')}:00
              </text>
            </g>
          );
        })}
        {view.map((c, i) => {
          const x = LEFT + i * step + step / 2;
          const yOpen = valueY(c.open);
          const yClose = valueY(c.close);
          const color = c.close >= c.open ? '#17bf98' : '#e65d75';
          const bodyWidth = Math.max(1.5, step * 0.58);
          const volumeHeight = (c.volume / maxVolume) * 56;
          return (
            <g key={`${interval}-${i}`}>
              <line x1={x} x2={x} y1={valueY(c.high)} y2={valueY(c.low)} stroke={color} strokeWidth="1.25" />
              <rect
                x={x - bodyWidth / 2}
                y={Math.min(yOpen, yClose)}
                width={bodyWidth}
                height={Math.max(1.35, Math.abs(yOpen - yClose))}
                fill={color}
                rx=".25"
              />
              <rect
                x={x - bodyWidth / 2}
                y={319 - volumeHeight}
                width={bodyWidth}
                height={volumeHeight}
                fill={color}
                opacity=".23"
              />
            </g>
          );
        })}
        {current && (
          <g>
            <line
              x1={LEFT}
              y1={valueY(current.close)}
              x2="853"
              y2={valueY(current.close)}
              stroke="#d5b76c"
              strokeWidth=".75"
              strokeDasharray="4 5"
            />
            <rect x="853" y={valueY(current.close) - 10} width="45" height="20" rx="3" fill="#d5b76c" />
            <text x="858" y={valueY(current.close) + 3.7} className="last-price">
              {money(current.close)}
            </text>
          </g>
        )}
      </svg>

      <div className={`scanner-track ${mode}`} aria-hidden="true">
        <span className="scanner-label">MARKET SCAN</span>
        <div className="scanner-line">
          <span className="scanner-marker" />
        </div>
      </div>
    </div>
  );
}
