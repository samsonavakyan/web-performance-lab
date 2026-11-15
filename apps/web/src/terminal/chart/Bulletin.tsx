import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

// The notice arrives a moment after the page loads, as a server push would.
const SHOW_DELAY_MS = 2300;

export function Bulletin({ replay }: { replay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [replay]);

  return (
    <div className="bulletin-slot">
      {visible ? (
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
      ) : (
        <div className="bulletin-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
