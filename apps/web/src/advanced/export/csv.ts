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

export function escapeCsv(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function formatRowSlow(trade: Trade) {
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

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'UTC' });
const moneyFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatRowFast(trade: Trade) {
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
