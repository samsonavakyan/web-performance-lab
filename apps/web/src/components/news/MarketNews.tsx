import { ArrowRight } from 'lucide-react';
import type { NewsItem } from '../../types';

type Props = {
  items: NewsItem[];
};

export function MarketNews({ items }: Props) {
  return (
    <section className="panel news-panel">
      <div className="panel-heading">
        <div>
          <h2>Market briefing</h2>
          <p>Latest headlines</p>
        </div>
        <ArrowRight size={16} className="muted-icon" />
      </div>
      <div className="news-list">
        {items.map((item) => (
          <div className="news-item" key={item.id}>
            <div>
              <span>{item.category}</span>
              <time>{item.time}</time>
            </div>
            <strong>{item.title}</strong>
            <small>{item.source}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
