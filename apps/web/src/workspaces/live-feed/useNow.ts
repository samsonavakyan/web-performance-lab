import { useEffect, useState } from 'react';

export function useNow(interval: number) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval);

    return () => clearInterval(timer);
  }, [interval]);

  return now;
}
