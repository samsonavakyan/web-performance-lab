export function rngFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bases = [
  ['AAPL', 'Apple Inc.', 'Technology', 238.11],
  ['NVDA', 'NVIDIA Corp.', 'Technology', 143.76],
  ['MSFT', 'Microsoft Corp.', 'Technology', 427.44],
  ['TSLA', 'Tesla Inc.', 'Automotive', 253.08],
  ['AMZN', 'Amazon.com Inc.', 'Consumer', 193.41],
  ['GOOGL', 'Alphabet Inc.', 'Technology', 178.95],
  ['META', 'Meta Platforms', 'Technology', 557.39],
  ['BTCUSD', 'Bitcoin / USD', 'Crypto', 67482.10],
  ['ETHUSD', 'Ethereum / USD', 'Crypto', 3541.60],
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
  ['BA', 'Boeing Co.', 'Industrials', 174.16]
];

const adjectives = ['Global', 'Quantum', 'Prime', 'Atlas', 'Horizon', 'North', 'Cobalt', 'Vertex', 'Summit', 'Crest', 'Beacon', 'Nexus', 'Pioneer', 'Nova', 'Apex'];
const nouns = ['Energy', 'Capital', 'Dynamics', 'Holdings', 'Technologies', 'Labs', 'Systems', 'Industries', 'Partners', 'Networks', 'Markets'];

export function makeInstruments(count = 2200, seed = 42) {
  const rand = rngFrom(seed);
  const instruments = bases.map(([symbol, name, sector, price], index) => ({
    symbol, name, sector, price, change: +(rand() * 8 - 3.2).toFixed(2),
    volume: Math.round(1_000_000 + rand() * 40_000_000),
    sparkline: Array.from({length: 20}, (_, i) => +((price * (0.99 + rand() * .02)) * (1 + i * .0002)).toFixed(2)),
    id: index
  }));
  for (let i = instruments.length; i < count; i++) {
    const symbol = `ML${String(i).padStart(4, '0')}`;
    const name = `${adjectives[i % adjectives.length]} ${nouns[Math.floor(i / adjectives.length) % nouns.length]} ${i}`;
    const sector = ['Technology', 'Financials', 'Energy', 'Industrials', 'Healthcare', 'Consumer'][i % 6];
    const price = +(18 + rand() * 890).toFixed(2);
    const change = +(rand() * 11 - 5.5).toFixed(2);
    const sparkline = Array.from({length: 20}, (_, j) => +((price + Math.sin(j * .4) * price * .008 + rand() * price * .014)).toFixed(2));
    instruments.push({ symbol, name, sector, price, change,
      volume: Math.round(100_000 + rand() * 25_000_000), sparkline, id: i });
  }
  return instruments;
}

export function makeCandles(symbol = 'NVDA', count = 160, seed = 784, startingPrice) {
  let hash = seed;
  for (const ch of symbol) hash = (Math.imul(hash, 33) ^ ch.charCodeAt(0)) >>> 0;
  const rand = rngFrom(hash);
  let price = startingPrice ?? (symbol === 'BTCUSD' ? 67000 : symbol === 'NVDA' ? 143 : 210);
  const candles = [];
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = Math.max(1, open * (1 + (rand() - .49) * .019));
    const high = Math.max(open, close) * (1 + rand() * .008);
    const low = Math.min(open, close) * (1 - rand() * .008);
    const volume = 500_000 + Math.round(rand() * 7_000_000);
    candles.push({time: i, open: +open.toFixed(3), close: +close.toFixed(3), high: +high.toFixed(3), low: +low.toFixed(3), volume});
    price = close;
  }
  return candles;
}

export function makeOrderBook(symbol = 'NVDA', rows = 85, startingPrice) {
  const rand = rngFrom(Array.from(symbol).reduce((acc, ch) => acc + ch.charCodeAt(0), 245));
  const center = startingPrice ?? (symbol === 'BTCUSD' ? 67000 : 143.76);
  return Array.from({length: rows}, (_, i) => ({
    id: i,
    bid: +(center - .02 * (i + 1)).toFixed(2),
    ask: +(center + .02 * (i + 1)).toFixed(2),
    bidSize: Math.round(40 + rand() * 700),
    askSize: Math.round(40 + rand() * 700)
  }));
}

export function makeOverview(mode = 'optimized') {
  const full = mode === 'baseline';
  const random = rngFrom(777);
  const highlights = [
    { symbol: 'NVDA', price: 143.76, change: 2.84 },
    { symbol: 'BTCUSD', price: 67482.1, change: 1.32 },
    { symbol: 'SPY', price: 585.72, change: -0.28 },
    { symbol: 'TSLA', price: 253.08, change: -1.47 }
  ];
  return {
    asOf: '2026-01-02T15:30:00Z',
    title: 'Market pulse',
    highlights,
    extras: full ? Array.from({length: 12000}, (_, i) => ({
      id: i, x: random(), y: random(), z: random(), sector: 'Technology'
    })) : []
  };
}

export const NEWS = [
  {id: 1, time: '09:41', category: 'EQUITIES', title: 'Semiconductors lead as technology stocks climb', source: 'MarketLab Wire'},
  {id: 2, time: '09:18', category: 'MACRO', title: 'Bond yields steady ahead of central bank update', source: 'MarketLab Wire'},
  {id: 3, time: '08:52', category: 'CRYPTO', title: 'Digital assets trade higher after a quiet session', source: 'MarketLab Wire'},
  {id: 4, time: '08:37', category: 'EARNINGS', title: 'Markets weigh earnings outlook across major sectors', source: 'MarketLab Wire'}
];
