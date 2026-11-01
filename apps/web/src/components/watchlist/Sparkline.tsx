type Props = {
  values: number[];
  positive: boolean;
};

export function Sparkline({ values, positive }: Props) {
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((v, index) => `${index * 3.6},${24 - ((v - min) / range) * 22}`).join(' ');

  return (
    <svg viewBox="0 0 70 26" className={`sparkline ${positive ? 'positive' : 'negative'}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
