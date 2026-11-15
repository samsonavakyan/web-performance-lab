import { memo, useEffect } from 'react';
import type { Quote } from '../../types';
import { OrderTicket, PositionRow, PositionsTable, QuoteCell } from './DeskParts';
import type { DeskProps, Position } from './DeskParts';
import { quoteSocket } from './quoteSocket';
import { quoteStore, useQuote } from './quoteStore';

const priceFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPrice = (value: number) => priceFormat.format(value);

// Applies all messages that arrive within one frame as a single store update.
function useQuoteUpdates() {
  useEffect(() => {
    let pending: Quote[] = [];
    let frame = 0;
    const unsubscribe = quoteSocket.subscribe((updates) => {
      pending.push(...updates);
      frame ||= requestAnimationFrame(() => {
        quoteStore.apply(pending);
        pending = [];
        frame = 0;
      });
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, []);
}

const LiveQuoteCell = memo(function LiveQuoteCell({ symbol }: { symbol: string }) {
  return <QuoteCell quote={useQuote(symbol)} format={formatPrice} />;
});

const LivePositionRow = memo(function LivePositionRow({ position }: { position: Position }) {
  return <PositionRow position={position} quote={useQuote(position.symbol)} format={formatPrice} />;
});

function LiveOrderTicket({ symbol }: { symbol: string }) {
  return <OrderTicket symbol={symbol} quote={useQuote(symbol)} format={formatPrice} />;
}

export function Desk({ symbols, positions }: DeskProps) {
  useQuoteUpdates();
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
