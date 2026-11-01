import { CircleHelp, Clock3, Wifi } from 'lucide-react';

type Props = {
  connected: boolean;
};

export function Footer({ connected }: Props) {
  return (
    <footer className="terminal-footer">
      <div>
        <span className="status-dot" />
        {connected ? 'Connected' : 'Connecting…'}
        <span className="footer-divider" />
        <Wifi size={12} /> WS / 700ms
      </div>
      <div>
        <Clock3 size={12} /> Market hours 09:30–16:00 ET
      </div>
      <div>
        <CircleHelp size={13} /> Help
      </div>
    </footer>
  );
}
