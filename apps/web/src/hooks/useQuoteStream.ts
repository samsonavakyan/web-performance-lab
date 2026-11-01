import { useEffect, useRef, useState } from 'react';
import type { Quote } from '../types';

type StreamMessage = { kind: string; seq?: number; updates?: Quote[] };

export function useQuoteStream(paused: boolean) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [seq, setSeq] = useState(0);
  const [connected, setConnected] = useState(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${location.host}/ws/quotes`);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      const msg = JSON.parse(String(event.data)) as StreamMessage;
      if (msg.kind !== 'quotes' || pausedRef.current || !msg.updates) return;
      setSeq(msg.seq ?? 0);
      setQuotes((previous) => {
        const next = { ...previous };
        for (const item of msg.updates ?? []) next[item.symbol] = item;
        return next;
      });
    };
    return () => socket.close();
  }, []);

  return { quotes, seq, connected };
}
