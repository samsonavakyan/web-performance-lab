import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import type { Mode } from '../../types';

const SHOW_DELAY_MS = 2300;

type Props = {
  mode: Mode;
  replay: number;
};

export function Bulletin({ mode, replay }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mode, replay]);

  return (
    <div className={`bulletin-slot ${mode}`}>
      {visible && (
        <div className="market-bulletin">
          <div className="bulletin-emblem">
            <Bell size={18} />
          </div>
          <div>
            <strong>MARKET NOTICE</strong>
            <p>Upcoming economic data may increase volatility across major indices.</p>
          </div>
          <span>JUST NOW</span>
        </div>
      )}
      {!visible && mode === 'optimized' && <div className="bulletin-placeholder" aria-hidden="true" />}
    </div>
  );
}
