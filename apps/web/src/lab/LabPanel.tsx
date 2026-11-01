import { BookOpen, ExternalLink, FlaskConical, RefreshCcw, RotateCcw, X } from 'lucide-react';
import { SCENARIOS } from '../types';
import type { Mode, Scenario } from '../types';
import type { Modes } from './modes';

type Props = {
  modes: Modes;
  onModeChange: (id: Scenario, mode: Mode) => void;
  onReplayBulletin: () => void;
  onReloadOverview: () => void;
  onClose: () => void;
};

export function LabPanel({ modes, onModeChange, onReplayBulletin, onReloadOverview, onClose }: Props) {
  return (
    <aside className="lab-panel">
      <div className="lab-header">
        <div className="lab-title">
          <FlaskConical size={19} />
          <div>
            <h2>Performance Lab</h2>
            <span>Reproducible scenarios</span>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} title="Close lab controls">
          <X size={18} />
        </button>
      </div>

      <div className="lab-intro">
        <span className="simulation-dot" /> Toggle one scenario at a time and record a trace in Chrome DevTools.
      </div>

      <div className="scenario-list">
        {SCENARIOS.map((scenario, index) => (
          <div className="scenario" key={scenario.id}>
            <div className="scenario-heading">
              <span className="scenario-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{scenario.title}</strong>
                <small>{scenario.subtitle}</small>
              </div>
              <span className="scenario-area">{scenario.area}</span>
            </div>
            <div className="scenario-buttons">
              <button
                className={modes[scenario.id] === 'baseline' ? 'selected bad' : ''}
                onClick={() => onModeChange(scenario.id, 'baseline')}
              >
                Baseline
              </button>
              <button
                className={modes[scenario.id] === 'optimized' ? 'selected good' : ''}
                onClick={() => onModeChange(scenario.id, 'optimized')}
              >
                Optimized
              </button>
            </div>
            <p className="scenario-hint">{scenario.hint}</p>
            {scenario.id === 'shift' && (
              <button className="replay" onClick={onReplayBulletin}>
                <RotateCcw size={13} /> Replay bulletin
              </button>
            )}
            {scenario.id === 'loading' && (
              <button className="replay" onClick={onReloadOverview}>
                <RefreshCcw size={13} /> Reload overview
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="lab-bottom">
        <a href="https://developer.chrome.com/docs/devtools/performance/overview/" target="_blank" rel="noreferrer">
          <BookOpen size={14} /> Performance documentation <ExternalLink size={12} />
        </a>
        <span>CHROME DEVTOOLS → PERFORMANCE</span>
      </div>
    </aside>
  );
}
