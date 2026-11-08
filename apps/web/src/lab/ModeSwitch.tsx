import type { Mode } from '../types';

type Props = { mode: Mode; onChange: (mode: Mode) => void };

export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="scenario-buttons" role="group" aria-label="Mode">
      <button
        className={mode === 'baseline' ? 'selected bad' : ''}
        aria-pressed={mode === 'baseline'}
        onClick={() => onChange('baseline')}
      >
        Baseline
      </button>
      <button
        className={mode === 'optimized' ? 'selected good' : ''}
        aria-pressed={mode === 'optimized'}
        onClick={() => onChange('optimized')}
      >
        Optimized
      </button>
    </div>
  );
}
