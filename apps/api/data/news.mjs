export const NEWS = [
  {
    id: 1,
    time: '09:41',
    category: 'EQUITIES',
    title: 'Semiconductors lead as technology stocks climb',
    source: 'MarketLab Wire',
  },
  {
    id: 2,
    time: '09:18',
    category: 'MACRO',
    title: 'Bond yields steady ahead of central bank update',
    source: 'MarketLab Wire',
  },
  {
    id: 3,
    time: '08:52',
    category: 'CRYPTO',
    title: 'Digital assets trade higher after a quiet session',
    source: 'MarketLab Wire',
  },
  {
    id: 4,
    time: '08:37',
    category: 'EARNINGS',
    title: 'Markets weigh earnings outlook across major sectors',
    source: 'MarketLab Wire',
  },
];

// Headlines for the instrument page, about the instrument itself.
export const instrumentHeadlines = ({ symbol, name, sector }) =>
  sector === 'Crypto'
    ? [
        `${name} holds steady as crypto volumes climb`,
        `Funding rates for ${symbol} turn positive`,
        `Exchange outflows of ${symbol} rise for a third day`,
        `${name} trades in a narrow range overnight`,
      ]
    : [
        `${name} trades in line with the ${sector.toLowerCase()} sector`,
        `Analysts update price targets for ${symbol}`,
        `${symbol} options volume rises ahead of the next report`,
        `${name} shares open steady after a quiet session`,
      ];
