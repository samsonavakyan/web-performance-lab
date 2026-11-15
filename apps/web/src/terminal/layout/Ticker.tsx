import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';
import { INDICES } from './indices';

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
