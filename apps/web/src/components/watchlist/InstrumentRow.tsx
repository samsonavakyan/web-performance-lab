import { money, signed } from '../../lib/format';
import type { Instrument, Quote } from '../../types';
import { Sparkline } from './Sparkline';

type Props = {
  item: Instrument;
  quote?: Quote;
  selected: boolean;
  onSelect: (symbol: string) => void;
};

export function InstrumentRow({ item, quote, selected, onSelect }: Props) {
  const change = quote?.change ?? item.change;

  return (
    <button
      className={`instrument-row ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(item.symbol)}
      title={`Open ${item.name}`}
    >
      <div className="instrument-identity">
        <div className="symbol-icon">{item.symbol.slice(0, 2)}</div>
        <div>
          <strong>{item.symbol}</strong>
          <span>{item.name}</span>
        </div>
      </div>
      <div className="instrument-price">
        <strong>{money(quote?.price ?? item.price)}</strong>
        <Sparkline values={item.sparkline} positive={change >= 0} />
      </div>
      <span className={`change-pill ${change >= 0 ? 'up' : 'down'}`}>{signed(change)}</span>
    </button>
  );
}
