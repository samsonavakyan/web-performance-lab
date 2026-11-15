import { Activity } from 'lucide-react';

type Props = {
  seq: number;
  connected: boolean;
  paused: boolean;
  selected: string;
};

export function ActivityPanel({ seq, connected, paused, selected }: Props) {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <h2>Session activity</h2>
          <p>Quote stream</p>
        </div>
        <Activity size={16} className="muted-icon" />
      </div>
      <div className="activity-rows">
        <div>
          <span>Connection</span>
          <strong className={connected ? 'txt-up' : 'txt-down'}>{connected ? 'Connected' : 'Disconnected'}</strong>
        </div>
        <div>
          <span>Stream</span>
          <strong>{paused ? 'Paused' : 'Receiving quotes'}</strong>
        </div>
        <div>
          <span>Messages</span>
          <strong>{seq.toLocaleString()}</strong>
        </div>
        <div>
          <span>Selected</span>
          <strong>{selected}</strong>
        </div>
        <div>
          <span>Update interval</span>
          <strong>700 ms</strong>
        </div>
      </div>
      <div className="activity-foot">
        <span className="status-dot" /> Read-only session
      </div>
    </section>
  );
}
