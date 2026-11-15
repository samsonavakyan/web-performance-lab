import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Quote } from '../../types';

export type Position = { symbol: string; quantity: number; cost: number };
export type DeskProps = { symbols: string[]; positions: Position[] };
type Format = (value: number) => string;

export function QuoteCell({ quote, format }: { quote?: Quote; format: Format }) {
  if (!quote) return <div className="quote-cell" />;
  return (
    <div className={`quote-cell ${quote.change >= 0 ? 'up' : 'down'}`}>
      <span>{quote.symbol}</span>
      <strong>{format(quote.price)}</strong>
    </div>
  );
}

export function PositionRow({ position, quote, format }: { position: Position; quote?: Quote; format: Format }) {
  const pnl = quote ? (quote.price - position.cost) * position.quantity : 0;
  return (
    <tr>
      <td>{position.symbol}</td>
      <td>{position.quantity}</td>
      <td>{format(position.cost)}</td>
      <td>{quote ? format(quote.price) : '-'}</td>
      <td className={pnl >= 0 ? 'txt-up' : 'txt-down'}>{format(pnl)}</td>
    </tr>
  );
}

export function OrderTicket({ symbol, quote, format }: { symbol: string; quote?: Quote; format: Format }) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const notional = price.trim() ? Number(price) * Number(quantity) : NaN;
  return (
    <form className="order-ticket" onSubmit={(event) => event.preventDefault()}>
      <h2>Order ticket · {symbol}</h2>
      <p>Last: {quote ? format(quote.price) : '-'}</p>
      <div className="side-switch">
        {(['BUY', 'SELL'] as const).map((value) => (
          <button type="button" key={value} aria-pressed={side === value} onClick={() => setSide(value)}>
            {value}
          </button>
        ))}
      </div>
      <label>
        Limit price
        <input aria-label="Limit price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label>
        Quantity
        <input aria-label="Quantity" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </label>
      <p>Notional: {Number.isFinite(notional) ? format(notional) : '-'}</p>
    </form>
  );
}

export function PositionsTable({ children }: { children: ReactNode }) {
  return (
    <table className="positions">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Qty</th>
          <th>Cost</th>
          <th>Last</th>
          <th>P&amp;L</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
