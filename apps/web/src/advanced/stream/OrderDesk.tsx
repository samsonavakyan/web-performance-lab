import { memo, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Instrument, Mode, Quote } from '../../types';
import { Metric, useWorstInteraction } from '../metrics';
import { quoteStore, useQuote, useQuoteState } from './quoteStore';

const BOARD_SIZE = 800;
const POSITIONS = 150;
const MESSAGES_PER_SECOND = 120;
const UPDATES_PER_MESSAGE = 20;

function formatPriceSlow(value: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
const priceFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPriceFast = (value: number) => priceFormat.format(value);

function useStream(running: boolean, mode: Mode, symbols: string[]) {
  useEffect(() => {
    if (!running || !symbols.length) return;
    let pending: Quote[] = [];
    let frame = 0;
    const timer = window.setInterval(() => {
      const updates = Array.from({ length: UPDATES_PER_MESSAGE }, () => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const previous = quoteStore.getState().quotes[symbol];
        const price = +(previous.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2);
        return { symbol, price, change: +(previous.change + (Math.random() - 0.5) * 0.05).toFixed(2) };
      });
      if (mode === 'baseline') {
        quoteStore.apply(updates);
        return;
      }
      pending.push(...updates);
      frame ||= requestAnimationFrame(() => {
        quoteStore.apply(pending);
        pending = [];
        frame = 0;
      });
    }, 1000 / MESSAGES_PER_SECOND);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, [running, mode, symbols]);
}

function QuoteCell({ quote, format }: { quote?: Quote; format: (value: number) => string }) {
  if (!quote) return <div className="quote-cell" />;
  return (
    <div className={`quote-cell ${quote.change >= 0 ? 'up' : 'down'}`}>
      <span>{quote.symbol}</span>
      <strong>{format(quote.price)}</strong>
    </div>
  );
}
const LiveQuoteCell = memo(function LiveQuoteCell({ symbol }: { symbol: string }) {
  return <QuoteCell quote={useQuote(symbol)} format={formatPriceFast} />;
});

function PositionRow({
  position,
  quote,
  format,
}: {
  position: { symbol: string; quantity: number; cost: number };
  quote?: Quote;
  format: (value: number) => string;
}) {
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
const LivePositionRow = memo(function LivePositionRow({
  position,
}: {
  position: { symbol: string; quantity: number; cost: number };
}) {
  return <PositionRow position={position} quote={useQuote(position.symbol)} format={formatPriceFast} />;
});

function OrderTicket({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const notional = Number(price) * Number(quantity);
  return (
    <form className="order-ticket" onSubmit={(event) => event.preventDefault()}>
      <h2>Order ticket · {symbol}</h2>
      <p>Last: {quote ? formatPriceFast(quote.price) : '-'}</p>
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
      <p>Notional: {Number.isFinite(notional) ? formatPriceFast(notional) : '-'}</p>
    </form>
  );
}
function LiveOrderTicket({ symbol }: { symbol: string }) {
  return <OrderTicket symbol={symbol} quote={useQuote(symbol)} />;
}

function BaselineDesk({ symbols, positions }: DeskProps) {
  const { quotes } = useQuoteState();
  return (
    <div className="order-desk">
      <OrderTicket symbol={symbols[0]} quote={quotes[symbols[0]]} />
      <div className="quote-board">
        {symbols.map((symbol) => (
          <QuoteCell key={symbol} quote={quotes[symbol]} format={formatPriceSlow} />
        ))}
      </div>
      <PositionsTable>
        {positions.map((position) => (
          <PositionRow key={position.symbol} position={position} quote={quotes[position.symbol]} format={formatPriceSlow} />
        ))}
      </PositionsTable>
    </div>
  );
}

function OptimizedDesk({ symbols, positions }: DeskProps) {
  return (
    <div className="order-desk">
      <LiveOrderTicket symbol={symbols[0]} />
      <div className="quote-board">
        {symbols.map((symbol) => (
          <LiveQuoteCell key={symbol} symbol={symbol} />
        ))}
      </div>
      <PositionsTable>
        {positions.map((position) => (
          <LivePositionRow key={position.symbol} position={position} />
        ))}
      </PositionsTable>
    </div>
  );
}

type DeskProps = { symbols: string[]; positions: { symbol: string; quantity: number; cost: number }[] };

function PositionsTable({ children }: { children: ReactNode }) {
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

function MessageRate() {
  const [rate, setRate] = useState(0);
  const last = useRef(quoteStore.getState().version);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const version = quoteStore.getState().version;
      setRate(version - last.current);
      last.current = version;
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <Metric label="Store updates / s" value={String(rate)} />;
}

export function OrderDesk({ mode }: { mode: Mode }) {
  const [desk, setDesk] = useState<DeskProps | null>(null);
  const [running, setRunning] = useState(false);
  const { worst, reset } = useWorstInteraction();

  useEffect(() => {
    fetch(`/api/instruments?limit=${BOARD_SIZE}`)
      .then((response) => response.json())
      .then((instruments: Instrument[]) => {
        quoteStore.reset(instruments.map(({ symbol, price, change }) => ({ symbol, price, change })));
        setDesk({
          symbols: instruments.map((item) => item.symbol),
          positions: instruments.slice(0, POSITIONS).map((item, i) => ({
            symbol: item.symbol,
            quantity: 50 + ((i * 37) % 400),
            cost: +(item.price * (1 + ((i % 7) - 3) / 100)).toFixed(2),
          })),
        });
      });
  }, []);
  useStream(running, mode, desk?.symbols ?? EMPTY);

  return (
    <>
      <p>
        The stream sends {MESSAGES_PER_SECOND} messages per second with {UPDATES_PER_MESSAGE} quotes each. Start it and
        type a limit price in the order ticket.
      </p>
      <div className="advanced-controls">
        <button onClick={() => setRunning((value) => !value)} disabled={!desk}>
          {running ? 'Stop stream' : 'Start stream'}
        </button>
        <button onClick={reset}>Reset measurement</button>
        <span role="status">{running ? 'Streaming' : 'Ready'}</span>
      </div>
      <div className="metric-grid">
        <Metric label="Worst interaction" value={`${worst.toFixed(0)} ms`} tone={worst > 200 ? 'bad' : worst ? 'good' : undefined} />
        <MessageRate />
      </div>
      {desk && (mode === 'baseline' ? <BaselineDesk {...desk} /> : <OptimizedDesk {...desk} />)}
    </>
  );
}
const EMPTY: string[] = [];
