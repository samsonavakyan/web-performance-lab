import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';

const INDICES = [
  { name: 'SPX 5,846.21', change: 0.42 },
  { name: 'NDX 20,741.58', change: 0.87 },
  { name: 'DJI 42,462.33', change: -0.15 },
  { name: 'VIX 14.79', change: -3.21 },
  { name: 'DXY 103.24', change: 0.08 },
  { name: 'BTC $67,482.10', change: 1.17 },
];

export function Ticker() {
  return (
    <div className="top-ticker">
      <div className="ticker-message">
        <Radio size={13} />
        <span>LIVE FEED</span>
      </div>
      {INDICES.map(({ name, change }) => {
        const isDown = change < 0;

        return (
          <div className="ticker-item" key={name}>
            <span>{name}</span>
            <span className={isDown ? 'txt-down' : 'txt-up'}>
              {isDown ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
