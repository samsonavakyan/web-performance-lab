import { money, signed } from '../../lib/format';
import type { OverviewState } from './useOverview';

export function OverviewStrip({ data, isPending, error, details }: OverviewState) {
  return (
    <section className="overview-section" aria-label="Market overview">
      <div className="overview-strip">
        <div className="overview-title">
          <span className="eyebrow">MARKET SNAPSHOT</span>
          <strong role="status">{isPending ? 'Loading market pulse…' : error || data?.title}</strong>
          <small>{isPending ? 'Fetching overview' : details || 'Updated just now'}</small>
        </div>
        <div className="overview-items" aria-busy={isPending}>
          {isPending
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
