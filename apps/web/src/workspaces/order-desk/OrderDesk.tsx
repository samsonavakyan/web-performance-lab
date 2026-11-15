import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { LabSlot } from '../../lab/LabSlot';
import { Desk } from '../../lab/variants';
import type { DeskProps } from './DeskParts';
import { quoteSocket } from './quoteSocket';
import { quoteStore } from './quoteStore';

const BOARD_SIZE = 1600;
const POSITIONS = 300;

export function OrderDesk() {
  const [desk, setDesk] = useState<DeskProps | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .instruments(BOARD_SIZE, controller.signal)
      .then((instruments) => {
        quoteStore.reset(instruments.map(({ symbol, price, change }) => ({ symbol, price, change })));
        setDesk({
          symbols: instruments.map((item) => item.symbol),
          positions: instruments.slice(0, POSITIONS).map((item, i) => ({
            symbol: item.symbol,
            quantity: 50 + ((i * 37) % 400),
            cost: +(item.price * (1 + ((i % 7) - 3) / 100)).toFixed(2),
          })),
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  // The simulated market continues from the prices on screen.
  useEffect(() => (running ? quoteSocket.start(Object.values(quoteStore.getState().quotes)) : undefined), [running]);

  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button
            onClick={() => setRunning((value) => !value)}
            disabled={!desk}
            title="Simulates an active market: 120 messages per second, 20 quotes each"
          >
            {running ? 'Stop stream' : 'Start stream'}
          </button>
        </div>
        <span role="status">{running ? 'Streaming' : 'Ready'}</span>
      </LabSlot>
      {desk && <Desk {...desk} />}
    </>
  );
}
