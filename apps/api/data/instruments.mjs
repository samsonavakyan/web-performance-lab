import { rngFrom } from './random.mjs';

// The first instruments are real tickers; the rest get generated names such as "Cobalt Systems 42".
const bases = [
  ['AAPL', 'Apple Inc.', 'Technology', 238.11],
  ['NVDA', 'NVIDIA Corp.', 'Technology', 143.76],
  ['MSFT', 'Microsoft Corp.', 'Technology', 427.44],
  ['TSLA', 'Tesla Inc.', 'Automotive', 253.08],
  ['AMZN', 'Amazon.com Inc.', 'Consumer', 193.41],
  ['GOOGL', 'Alphabet Inc.', 'Technology', 178.95],
  ['META', 'Meta Platforms', 'Technology', 557.39],
  ['BTCUSD', 'Bitcoin / USD', 'Crypto', 67482.1],
  ['ETHUSD', 'Ethereum / USD', 'Crypto', 3541.6],
  ['SPY', 'S&P 500 ETF', 'ETF', 585.72],
  ['QQQ', 'Nasdaq 100 ETF', 'ETF', 502.19],
  ['AMD', 'Advanced Micro Devices', 'Technology', 164.03],
  ['PLTR', 'Palantir Technologies', 'Technology', 45.62],
  ['NFLX', 'Netflix Inc.', 'Consumer', 741.31],
  ['COIN', 'Coinbase Global', 'Financials', 184.65],
  ['JPM', 'JPMorgan Chase', 'Financials', 212.27],
  ['V', 'Visa Inc.', 'Financials', 287.65],
  ['DIS', 'Walt Disney Co.', 'Media', 99.23],
  ['CRM', 'Salesforce Inc.', 'Technology', 287.41],
  ['BA', 'Boeing Co.', 'Industrials', 174.16],
];

const adjectives = [
  'Global',
  'Quantum',
  'Prime',
  'Atlas',
  'Horizon',
  'North',
  'Cobalt',
  'Vertex',
  'Summit',
  'Crest',
  'Beacon',
  'Nexus',
  'Pioneer',
  'Nova',
  'Apex',
];
const nouns = [
  'Energy',
  'Capital',
  'Dynamics',
  'Holdings',
  'Technologies',
  'Labs',
  'Systems',
  'Industries',
  'Partners',
  'Networks',
  'Markets',
];

export function makeInstruments(count = 2200, seed = 42) {
  const rand = rngFrom(seed);
  const instruments = bases.map(([symbol, name, sector, price], index) => ({
    symbol,
    name,
    sector,
    price,
    change: +(rand() * 8 - 3.2).toFixed(2),
    volume: Math.round(1_000_000 + rand() * 40_000_000),
    sparkline: Array.from({ length: 20 }, (_, i) => +(price * (0.99 + rand() * 0.02) * (1 + i * 0.0002)).toFixed(2)),
    id: index,
  }));
  for (let i = instruments.length; i < count; i++) {
    const symbol = `ML${String(i).padStart(4, '0')}`;
    const name = `${adjectives[i % adjectives.length]} ${nouns[Math.floor(i / adjectives.length) % nouns.length]} ${i}`;
    const sector = ['Technology', 'Financials', 'Energy', 'Industrials', 'Healthcare', 'Consumer'][i % 6];
    const price = +(18 + rand() * 890).toFixed(2);
    const change = +(rand() * 11 - 5.5).toFixed(2);
    const sparkline = Array.from(
      { length: 20 },
      (_, j) => +(price + Math.sin(j * 0.4) * price * 0.008 + rand() * price * 0.014).toFixed(2),
    );
    instruments.push({
      symbol,
      name,
      sector,
      price,
      change,
      volume: Math.round(100_000 + rand() * 25_000_000),
      sparkline,
      id: i,
    });
  }
  return instruments;
}
