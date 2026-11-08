import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { OverviewResponse } from '../../api/client';
import { money, signed } from '../../lib/format';
import type { Mode, Overview } from '../../types';

type Props = {
  mode: Mode;
  reload: number;
  response: OverviewResponse;
};

export function MarketOverview({ mode, reload, response }: Props) {
  const [data, setData] = useState<Overview | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setPending(true);
    setData(null);
    setError('');
    setDetails('');
    api
      .overview(mode, controller.signal, response)
      .then((result) => {
        if (!active) return;
        setData(result);
        setPending(false);
      })
      .catch((e: Error) => {
        if (!active || e.name === 'AbortError') return;
        setError('Overview unavailable');
        setDetails(e instanceof SyntaxError ? 'Unexpected response' : e.message);
        setPending(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [mode, reload, response]);

  return (
    <section className="overview-section" aria-label="Market overview">
      <div className="overview-strip">
        <div className="overview-title">
          <span className="eyebrow">MARKET SNAPSHOT</span>
          <strong role="status">{pending ? 'Loading market pulse…' : error || data?.title}</strong>
          <small>{pending ? 'Fetching overview' : details || 'Updated just now'}</small>
        </div>
        <div className="overview-items" aria-busy={pending}>
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
    </section>
  );
}
