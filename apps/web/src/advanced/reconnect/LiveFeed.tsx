import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../../types';
import { LabSlot } from '../../lab/LabSlot';
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
  const age = feed?.lastMessageAt ? Math.max(0, now - feed.lastMessageAt) / 1000 : 0;
  const peak = Math.max(1, ...(stats?.buckets ?? [1]));
  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button
            onClick={() => post('/api/lab/feed/sleep')}
            title="Imitates closing a laptop lid: open connections stop receiving data"
          >
            Simulate sleep
          </button>
          <button onClick={() => post('/api/lab/feed/wake')} title="Imitates opening the laptop lid again">
            Wake up
          </button>
          <button onClick={() => post('/api/lab/feed/restart')} title="Imitates a deploy of the feed service">
            Restart server
          </button>
        </div>
        <label className="checkbox" title="Adds 40 users simulated on the server with the same reconnect behavior">
          <input type="checkbox" checked={withDesks} onChange={(e) => setWithDesks(e.target.checked)} /> {DESKS} other
          users
        </label>
        <div className="server-monitoring">
          <strong>Server monitoring</strong>
          <span>
            {stats?.connected ?? 0} connections{stats?.restarting ? ' · restarting' : ''}
          </span>
          <div className="attempts" aria-label="Connection attempts per 250 ms, last 15 seconds">
            {(stats?.buckets ?? []).map((count, i) => (
              <span key={i} style={{ height: `${(count / peak) * 100}%` }} title={`${count} attempts`} />
            ))}
          </div>
          <small>Connection attempts per 250 ms, last 15 s</small>
        </div>
      </LabSlot>
      {feed && (
        <div className="feed-quote">
          <span>NVDA</span>
          <strong>{feed.price ? feed.price.toFixed(2) : '-'}</strong>
          <StatusBadge client={feed} mode={mode} now={now} />
          {mode === 'optimized' && feed.lastMessageAt > 0 && <small>Updated {age.toFixed(1)} s ago</small>}
        </div>
      )}
    </>
  );
}
