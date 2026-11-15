import { useEffect, useRef } from 'react';
import { FeedClient } from './feedClient.baseline';
import { useNow } from './useNow';

function StatusBadge({ client }: { client: FeedClient }) {
  const connected = client.status === 'live';
  return <span className={`feed-badge ${connected ? 'good' : 'bad'}`}>{connected ? 'Connected' : 'Disconnected'}</span>;
}

export function FeedQuote() {
  const client = useRef<FeedClient | null>(null);
  useNow(200);

  useEffect(() => {
    client.current = new FeedClient();
    return () => client.current?.dispose();
  }, []);

  const feed = client.current;
  if (!feed) return null;
  return (
    <div className="feed-quote">
      <span>NVDA</span>
      <strong>{feed.price ? feed.price.toFixed(2) : '-'}</strong>
      <StatusBadge client={feed} />
    </div>
  );
}
