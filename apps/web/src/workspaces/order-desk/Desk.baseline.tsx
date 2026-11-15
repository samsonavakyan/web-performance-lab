import { useEffect } from 'react';
import { OrderTicket, PositionRow, PositionsTable, QuoteCell } from './DeskParts';
import type { DeskProps } from './DeskParts';
import { quoteSocket } from './quoteSocket';
import { quoteStore, useQuoteState } from './quoteStore';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function useQuoteUpdates() {
  useEffect(() => quoteSocket.subscribe((updates) => quoteStore.apply(updates)), []);
}

export function Desk({ symbols, positions }: DeskProps) {
  useQuoteUpdates();
  const { quotes } = useQuoteState();
  return (
    <div className="order-desk">
      <OrderTicket symbol={symbols[0]} quote={quotes[symbols[0]]} format={formatPrice} />
      <div className="quote-board">
        {symbols.map((symbol) => (
          <QuoteCell key={symbol} quote={quotes[symbol]} format={formatPrice} />
        ))}
      </div>
      <PositionsTable>
        {positions.map((position) => (
          <PositionRow key={position.symbol} position={position} quote={quotes[position.symbol]} format={formatPrice} />
        ))}
      </PositionsTable>
    </div>
  );
}
