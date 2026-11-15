export type Instrument = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  sparkline: number[];
  id: number;
};
export type Candle = { time: number; open: number; close: number; high: number; low: number; volume: number };
export type BookLevel = { id: number; bid: number; ask: number; bidSize: number; askSize: number };
export type Quote = { symbol: string; price: number; change: number };
export type NewsItem = { id: number; time: string; category: string; title: string; source: string };
export type Overview = { asOf: string; title: string; highlights: Quote[]; extras: unknown[] };
