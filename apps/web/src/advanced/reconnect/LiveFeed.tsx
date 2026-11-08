import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../types';
import { Metric } from '../metrics';
import { FeedClient } from './feedClient';

const DESKS = 40;
type Stats = { connected: number; seq: number; restarting: boolean; buckets: number[] };

function useNow(interval: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

function StatusBadge({ client, mode, now }: { client: FeedClient; mode: Mode; now: number }) {
  if (mode === 'baseline') {
    const connected = client.status === 'live';
    return <span className={`feed-badge ${connected ? 'good' : 'bad'}`}>{connected ? 'Connected' : 'Disconnected'}</span>;
  }
  if (client.status === 'live') return <span className="feed-badge good">Live</span>;
  if (client.status === 'stale') return <span className="feed-badge bad">Stale · reconnecting</span>;
  const wait = Math.max(0, (client.retryAt - now) / 1000);
  return <span className="feed-badge warn">Reconnecting{wait ? ` in ${wait.toFixed(1)} s` : ''}</span>;
}

async function post(path: string) {
  await fetch(path, { method: 'POST' });
}

export function LiveFeed({ mode }: { mode: Mode }) {
  const client = useRef<FeedClient | null>(null);
  const [withDesks, setWithDesks] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const now = useNow(200);

  useEffect(() => {
    client.current = new FeedClient(mode);
    return () => client.current?.dispose();
  }, [mode]);

  useEffect(() => {
    void post(`/api/lab/feed/users?count=${withDesks ? DESKS : 0}&policy=${mode}`);
    return () => void post('/api/lab/feed/users?count=0');
  }, [mode, withDesks]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const response = await fetch('/api/lab/feed/stats');
      if (response.ok) setStats(await response.json());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const feed = client.current;
  const age = feed?.lastMessageAt ? (now - feed.lastMessageAt) / 1000 : 0;
  const peak = Math.max(1, ...(stats?.buckets ?? [1]));
  return (
    <>
      <p>
        NVDA price from the live feed. Simulate sleep and Wake up imitate closing and opening a laptop lid. Restart
        server imitates a deploy of the feed service.
      </p>
      <div className="advanced-controls">
        <button onClick={() => post('/api/lab/feed/sleep')}>Simulate sleep</button>
        <button onClick={() => post('/api/lab/feed/wake')}>Wake up</button>
        <button onClick={() => post('/api/lab/feed/restart')}>Restart server</button>
        <label className="checkbox">
          <input type="checkbox" checked={withDesks} onChange={(e) => setWithDesks(e.target.checked)} /> {DESKS} other
          users
        </label>
      </div>
      {feed && (
        <div className="feed-quote">
          <span>NVDA</span>
          <strong>{feed.price ? feed.price.toFixed(2) : '-'}</strong>
          <StatusBadge client={feed} mode={mode} now={now} />
          {mode === 'optimized' && feed.lastMessageAt > 0 && <small>Updated {age.toFixed(1)} s ago</small>}
        </div>
      )}
      <h3 className="lab-subheading">Lab diagnostics (not visible to the trader)</h3>
      <div className="metric-grid">
        <Metric label="Last message" value={`${age.toFixed(1)} s ago`} tone={age > 3 ? 'bad' : 'good'} />
        <Metric label="Client seq" value={String(feed?.lastSeq ?? 0)} />
        <Metric label="Server seq" value={String(stats?.seq ?? 0)} />
        <Metric label="Missed messages" value={String(feed?.missed ?? 0)} tone={feed?.missed ? 'bad' : undefined} />
        <Metric label="Resyncs" value={String(feed?.resyncs ?? 0)} />
        <Metric label="Server connections" value={String(stats?.connected ?? 0)} />
      </div>
      <div className="attempts" aria-label="Connection attempts per 250 ms, last 15 seconds">
        {(stats?.buckets ?? []).map((count, i) => (
          <span key={i} style={{ height: `${(count / peak) * 100}%` }} title={`${count} attempts`} />
        ))}
      </div>
      <small className="attempts-caption">
        Connection attempts per 250 ms, last 15 s{stats?.restarting ? ' · server is restarting or warming up' : ''}
      </small>
    </>
  );
}
