import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { money, signed } from '../../lib/format';
import type { Mode, Overview } from '../../types';

type Props = {
  mode: Mode;
  reload: number;
};

export function MarketOverview({ mode, reload }: Props) {
  const [data, setData] = useState<Overview | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setPending(true);
    setData(null);
    setError('');
    api
      .overview(mode, controller.signal)
      .then((result) => {
        setData(result);
        setPending(false);
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return;
        setError('Overview unavailable');
        setPending(false);
      });
    return () => controller.abort();
  }, [mode, reload]);

  return (
    <div className="overview-strip">
      <div className="overview-title">
        <span className="eyebrow">MARKET SNAPSHOT</span>
        <strong>{pending ? 'Loading market pulse…' : error || data?.title}</strong>
        <small>{pending ? 'Fetching overview' : 'Updated just now'}</small>
      </div>
      <div className="overview-items">
        {pending
          ? Array.from({ length: 4 }, (_, i) => <span key={i} className="overview-skeleton" />)
          : data?.highlights.map((item) => (
              <div className="overview-item" key={item.symbol}>
                <span>{item.symbol}</span>
                <strong>{money(item.price)}</strong>
                <small className={item.change >= 0 ? 'txt-up' : 'txt-down'}>{signed(item.change)}</small>
              </div>
            ))}
      </div>
    </div>
  );
}
