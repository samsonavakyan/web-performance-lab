export const money = (price: number) =>
  price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const signed = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
