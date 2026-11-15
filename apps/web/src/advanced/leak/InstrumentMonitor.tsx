import { useEffect, useState } from 'react';
import type { Instrument } from '../../types';
import { LabSlot } from '../../lab/LabSlot';
import { PriceChart } from '../../lab/variants';

const TRADING_DAY = 80;

export function InstrumentMonitor() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [readySymbol, setReadySymbol] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/instruments?limit=150')
      .then((response) => response.json())
      .then(setInstruments);
  }, []);

  const instrument = instruments[index];
  const running = remaining > 0;

  // Switches to the next instrument once the current chart is on screen.
  useEffect(() => {
    if (!running || readySymbol !== instrument?.symbol) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % instruments.length);
      setRemaining((count) => count - 1);
    }, 150);
    return () => clearTimeout(timer);
  }, [running, readySymbol, instrument, instruments.length]);
  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button
            disabled={running || !instruments.length}
            onClick={() => setRemaining(TRADING_DAY)}
            title="Switches through 80 instruments one by one, the way a trader does during a working day"
          >
            Simulate trading day
          </button>
        </div>
        <span role="status">{running ? `Switching ${TRADING_DAY - remaining}/${TRADING_DAY}` : 'Ready'}</span>
      </LabSlot>
      <div className="advanced-controls">
        <label>
          Instrument
          <select
            aria-label="Instrument"
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
          >
            {instruments.map((item, i) => (
              <option key={item.symbol} value={i}>
                {item.symbol}
              </option>
            ))}
          </select>
        </label>
      </div>
      {instrument && (
        <PriceChart key={instrument.symbol} instrument={instrument} onReady={setReadySymbol} />
      )}
      <label className="analysis-note">
        Trade note <input aria-label="Trade note" value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
    </>
  );
}
