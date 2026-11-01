import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';

const INDICES = ['SPX 5,846.21', 'NDX 20,741.58', 'DJI 42,462.33', 'VIX 14.79', 'DXY 103.24', 'BTC $67,482.10'];

export function Ticker() {
  return (
    <div className="top-ticker">
      <div className="ticker-message">
        <Radio size={13} />
        <span>LIVE FEED</span>
      </div>
      {INDICES.map((item, i) => {
        const down = i % 3 === 0;
        return (
          <div className="ticker-item" key={item}>
            <span>{item}</span>
            <span className={down ? 'txt-down' : 'txt-up'}>
              {down ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />} {down ? '0.28' : '1.32'}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
