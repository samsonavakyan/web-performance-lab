export type Trade = {
  id: number;
  time: string;
  symbol: string;
  name: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  account: string;
};

export const CSV_HEADER = 'Trade ID,Time,Symbol,Instrument,Side,Quantity,Price,Notional,Fee,Account\n';

// Values with a quote, comma or line break are wrapped in quotes, and inner quotes are doubled (RFC 4180).
export function escapeCsv(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'UTC' });
const moneyFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatTradeRow(trade: Trade) {
  return [
    String(trade.id),
    dateFormat.format(new Date(trade.time)),
    trade.symbol,
    trade.name,
    trade.side,
    String(trade.quantity),
    moneyFormat.format(trade.price),
    moneyFormat.format(trade.price * trade.quantity),
    moneyFormat.format(trade.fee),
    trade.account,
  ]
    .map(escapeCsv)
    .join(',');
}
