import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Instrument } from '../../types';

const PICKER_SIZE = 20;

type Props = {
  symbol: string;
  name: string;
  instruments: Instrument[];
  onSelect: (symbol: string) => void;
};

export function InstrumentPicker({ symbol, name, instruments, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !root.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [isOpen]);

  return (
    <div className="instrument-picker" ref={root}>
      <button className="picker-button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((v) => !v)}>
        <h2>{name}</h2>
        <ChevronDown size={15} />
      </button>
      {isOpen && (
        <ul className="picker-menu" role="listbox" aria-label="Instruments">
          {instruments.slice(0, PICKER_SIZE).map((item) => (
            <li key={item.symbol} role="option" aria-selected={item.symbol === symbol}>
              <button
                onClick={() => {
                  onSelect(item.symbol);
                  setIsOpen(false);
                }}
              >
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
