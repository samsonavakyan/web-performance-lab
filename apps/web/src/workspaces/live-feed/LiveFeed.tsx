import { useEffect, useState } from 'react';
import { LabSlot } from '../../lab/LabSlot';
import { useModes } from '../../lab/modes';
import { FeedQuote } from '../../lab/variants';

const DESKS = 40;
type Stats = { connected: number; seq: number; restarting: boolean; buckets: number[] };

async function post(path: string) {
  await fetch(path, { method: 'POST' });
}

// The live feed screen. Everything in LabSlot is the lab: server controls, simulated users and monitoring.
// The product part is FeedQuote.
export function LiveFeed() {
  const mode = useModes()['live-feed'];

  const [withDesks, setWithDesks] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

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

  const peak = Math.max(1, ...(stats?.buckets ?? [1]));

  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button
            onClick={() => post('/api/lab/feed/sleep')}
            title="Imitates closing a laptop lid. Connections stay open but receive nothing"
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
      <FeedQuote />
    </>
  );
}
