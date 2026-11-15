import { escapeCsv } from './csv';
import type { Trade } from './csv';

export function formatTradeRow(trade: Trade) {
  const time = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(trade.time),
  );
  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  return [
    String(trade.id),
    time,
    trade.symbol,
    trade.name,
    trade.side,
    String(trade.quantity),
    money(trade.price),
    money(trade.price * trade.quantity),
    money(trade.fee),
    trade.account,
  ]
    .map(escapeCsv)
    .join(',');
}
