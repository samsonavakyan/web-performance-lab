import { useEffect, useRef } from 'react';
import { FeedClient } from './feedClient';
import { useNow } from './useNow';

// Shows whether the price is fresh, not only whether the socket is open.
function StatusBadge({ client, now }: { client: FeedClient; now: number }) {
  if (client.status === 'live') return <span className="feed-badge good">Live</span>;
  if (client.status === 'stale') return <span className="feed-badge bad">Stale · reconnecting</span>;

  const wait = Math.max(0, (client.retryAt - now) / 1000);

  return <span className="feed-badge warn">Reconnecting{wait ? ` in ${wait.toFixed(1)} s` : ''}</span>;
}

export function FeedQuote() {
  const client = useRef<FeedClient | null>(null);

  const now = useNow(200);

  useEffect(() => {
    client.current = new FeedClient();

    return () => client.current?.dispose();
  }, []);

  const feed = client.current;
  if (!feed) return null;

  const age = feed.lastMessageAt ? Math.max(0, now - feed.lastMessageAt) / 1000 : 0;

  return (
    <div className="feed-quote">
      <span>NVDA</span>
      <strong>{feed.price ? feed.price.toFixed(2) : '-'}</strong>
      <StatusBadge client={feed} now={now} />
      {feed.lastMessageAt > 0 && <small>Updated {age.toFixed(1)} s ago</small>}
    </div>
  );
}
