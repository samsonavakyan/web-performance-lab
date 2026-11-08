import type { BookLevel, Candle, NewsItem } from '../../types';
import type { InstrumentInfo } from './data';

export function InfoView({ info }: { info: InstrumentInfo }) {
  return (
    <div className="nav-header">
      <div>
        <h2>{info.symbol}</h2>
        <span>
          {info.name} · {info.sector}
        </span>
      </div>
      <strong>{info.price.toFixed(2)}</strong>
      <span className={info.change >= 0 ? 'txt-up' : 'txt-down'}>{info.change.toFixed(2)}%</span>
    </div>
  );
}

export function ChartView({ candles }: { candles: Candle[] }) {
  const closes = candles.map((candle) => candle.close);
  const min = Math.min(...closes);
  const range = Math.max(...closes) - min || 1;
  const points = closes.map((close, i) => `${(i / (closes.length - 1)) * 600},${200 - ((close - min) / range) * 180}`);
  return (
    <svg className="nav-chart" viewBox="0 0 600 210" preserveAspectRatio="none" aria-label="Price history">
      <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function BookView({ levels }: { levels: BookLevel[] }) {
  return (
    <table className="nav-book" aria-label="Order book">
      <tbody>
        {levels.map((level) => (
          <tr key={level.id}>
            <td>{level.bidSize}</td>
            <td className="txt-up">{level.bid.toFixed(2)}</td>
            <td className="txt-down">{level.ask.toFixed(2)}</td>
            <td>{level.askSize}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function NewsView({ items }: { items: NewsItem[] }) {
  return (
    <ul className="nav-news" aria-label="Instrument news">
      {items.map((item) => (
        <li key={item.id}>
          <span>{item.time}</span> {item.title}
        </li>
      ))}
    </ul>
  );
}

export function Skeleton({ label, height = 120 }: { label: string; height?: number }) {
  return <div className="nav-skeleton" style={{ height }} aria-label={`Loading ${label}`} />;
}
