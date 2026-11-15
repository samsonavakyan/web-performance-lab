import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

// The notice arrives a moment after the page loads, as a server push would.
const SHOW_DELAY_MS = 2300;

// Returns true once the notice has arrived. A new replay value hides it and starts over.
export function useNoticeArrival(replay: number) {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [replay]);

  return isVisible;
}

export function BulletinNotice() {
  return (
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
  );
}
