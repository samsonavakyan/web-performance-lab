import { BookOpen, ExternalLink, FlaskConical, RefreshCcw, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SCENARIOS } from '../types';
import type { Mode, Scenario } from '../types';
import type { Modes } from './modes';
import type { OverviewResponse } from '../api/client';
import { ModeSwitch } from './ModeSwitch';

type Props = {
  modes: Modes;
  overviewResponse: OverviewResponse;
  onOverviewResponseChange: (response: OverviewResponse) => void;
  workload: number;
  onWorkloadChange: (workload: number) => void;
  activeScenario: Scenario | null;
  onModeChange: (id: Scenario, mode: Mode) => void;
  onReplayBulletin: () => void;
  onReloadOverview: () => void;
  onClose: () => void;
  onOpenCase: (id: Scenario) => void;
};

export function LabPanel({
  modes,
  overviewResponse,
  onOverviewResponseChange,
  workload,
  onWorkloadChange,
  activeScenario,
  onModeChange,
  onReplayBulletin,
  onReloadOverview,
  onClose,
  onOpenCase,
}: Props) {
  const [group, setGroup] = useState('Basic');
  useEffect(() => {
    setGroup(
      activeScenario && ['scheduling', 'context', 'computation', 'offline'].includes(activeScenario)
        ? 'Advanced'
        : 'Basic',
    );
  }, [activeScenario]);
  return (
    <aside className="lab-panel" aria-label="Case list">
      <div className="lab-header">
        <div className="lab-title">
          <FlaskConical size={22} />
          <div>
            <h2>Performance Lab</h2>
            <span>10 cases</span>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} title="Close lab controls">
          <X size={20} />
        </button>
      </div>
      <p className="lab-intro">Open a case. Compare the same interaction in Baseline and Optimized.</p>
      <nav className="lab-sections" role="tablist" aria-label="Case groups">
        {['Basic', 'Advanced'].map((name) => (
          <button key={name} role="tab" aria-selected={group === name} onClick={() => setGroup(name)}>
            {name} <span>{name === 'Basic' ? 6 : 4}</span>
          </button>
        ))}
      </nav>
      <div className="scenario-list">
        {[group].map((group) => (
          <section className="case-group" key={group} aria-label={`${group} cases`}>
            <h3>{group === 'Advanced' ? 'Advanced Lab' : 'Basic'}</h3>
            {SCENARIOS.map((scenario, index) => {
              if ((scenario.area === 'Advanced') !== (group === 'Advanced')) return null;
              const active = activeScenario === scenario.id;
              return (
                <div className={`scenario ${active ? 'active' : ''}`} data-scenario={scenario.id} key={scenario.id}>
                  <div className="scenario-heading">
                    <span className="scenario-number">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{scenario.title}</strong>
                      <small>{scenario.subtitle}</small>
                    </div>
                    {active && <span className="case-current">Open</span>}
                  </div>
                  <ModeSwitch mode={modes[scenario.id]} onChange={(mode) => onModeChange(scenario.id, mode)} />
                  {active && <p className="scenario-hint">{scenario.hint}</p>}
                  {scenario.id === 'loading' && (
                    <div className="experiment-controls">
                      <label>
                        Response
                        <select
                          aria-label="Overview response"
                          value={overviewResponse}
                          onChange={(event) => onOverviewResponseChange(event.target.value as OverviewResponse)}
                        >
                          <option value="normal">Normal</option>
                          <option value="unavailable">Unavailable</option>
                          <option value="invalid">Invalid data</option>
                        </select>
                      </label>
                    </div>
                  )}
                  {scenario.id === 'scheduling' && (
                    <div className="experiment-controls">
                      <label>
                        Workload
                        <select
                          aria-label="Workload"
                          value={workload}
                          onChange={(event) => onWorkloadChange(Number(event.target.value))}
                        >
                          <option value={60}>60</option>
                          <option value={120}>120</option>
                          <option value={240}>240</option>
                        </select>
                      </label>
                    </div>
                  )}

                  <div className="scenario-actions">
                    <button className="open-case" onClick={() => onOpenCase(scenario.id)}>
                      Open case
                    </button>
                    {scenario.id === 'shift' && (
                      <button className="replay" onClick={onReplayBulletin}>
                        <RotateCcw size={15} /> Replay bulletin
                      </button>
                    )}
                    {scenario.id === 'loading' && (
                      <button className="replay" onClick={onReloadOverview}>
                        <RefreshCcw size={15} /> Reload overview
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
      <div className="lab-bottom">
        <a href="https://developer.chrome.com/docs/devtools/performance/overview/" target="_blank" rel="noreferrer">
          <BookOpen size={16} /> Performance documentation <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
}
