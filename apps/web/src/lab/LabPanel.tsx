import { FlaskConical, Pause, Play, RefreshCcw, RotateCcw, Timer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ADVANCED_CASES, CASES, isAdvanced } from './cases';
import type { Mode, Scenario } from './cases';
import type { Modes } from './modes';
import type { OverviewResponse } from '../api/client';
import { ModeSwitch } from './ModeSwitch';
import { setLabSlot } from './LabSlot';
import { setTimings, useTimings } from './timings';

type Props = {
  modes: Modes;
  overviewResponse: OverviewResponse;
  onOverviewResponseChange: (response: OverviewResponse) => void;
  activeScenario: Scenario | null;
  onModeChange: (id: Scenario, mode: Mode) => void;
  onReplayBulletin: () => void;
  onReloadOverview: () => void;
  onClose: () => void;
  onOpenCase: (id: Scenario) => void;
  streamPaused: boolean;
  onToggleStream: () => void;
};

export function LabPanel({
  modes,
  overviewResponse,
  onOverviewResponseChange,
  activeScenario,
  onModeChange,
  onReplayBulletin,
  onReloadOverview,
  onClose,
  onOpenCase,
  streamPaused,
  onToggleStream,
}: Props) {
  const [group, setGroup] = useState('Basic');
  const timings = useTimings();
  useEffect(() => {
    setGroup(activeScenario && isAdvanced(activeScenario) ? 'Advanced' : 'Basic');
  }, [activeScenario]);
  useEffect(() => {
    if (!activeScenario) return;
    const timer = window.setTimeout(
      () => document.querySelector(`[data-scenario="${activeScenario}"]`)?.scrollIntoView({ block: 'nearest' }),
      200,
    );
    return () => clearTimeout(timer);
  }, [activeScenario, group]);
  return (
    <aside className="lab-panel" aria-label="Case list">
      <div className="lab-header">
        <div className="lab-title">
          <FlaskConical size={22} />
          <div>
            <h2>Performance Lab</h2>
            <span>{CASES.length} cases</span>
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
            {name} <span>{name === 'Basic' ? CASES.length - ADVANCED_CASES.length : ADVANCED_CASES.length}</span>
          </button>
        ))}
      </nav>
      {group === 'Basic' && (
        <div className="lab-stream">
          <span>Quote stream {streamPaused ? 'paused' : 'running'}</span>
          <button onClick={onToggleStream}>
            {streamPaused ? <Play size={14} /> : <Pause size={14} />} {streamPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      )}
      <div className="scenario-list">
        {[group].map((group) => (
          <section className="case-group" key={group} aria-label={`${group} cases`}>
            {CASES.map((scenario, index) => {
              if (scenario.group !== group) return null;
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
                  {scenario.hasTimings && (
                    <button
                      className="timings-toggle"
                      role="switch"
                      aria-checked={timings.has(scenario.id)}
                      onClick={() => setTimings(scenario.id, !timings.has(scenario.id))}
                      title="Adds User Timing measures to the Timings track of the Performance panel"
                    >
                      <Timer size={14} /> Timings
                      <span className="switch-track" aria-hidden="true" />
                    </button>
                  )}
                  {active && (
                    <div className="case-brief">
                      <details className="case-toggle" open>
                        <summary>Complaint · {scenario.complaint.from}</summary>
                        <blockquote>{scenario.complaint.text}</blockquote>
                      </details>
                      <details className="case-toggle">
                        <summary>Reproduce</summary>
                        <p>{scenario.steps}</p>
                      </details>
                    </div>
                  )}
                  {active && scenario.group === 'Advanced' && <div className="lab-slot" ref={setLabSlot} />}
                  {scenario.id === 'overview' && (
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
                  <div className="scenario-actions">
                    {!(active && scenario.group === 'Advanced') && (
                      <button className="open-case" onClick={() => onOpenCase(scenario.id)}>
                        Open case
                      </button>
                    )}
                    {scenario.id === 'bulletin' && (
                      <button className="replay" onClick={onReplayBulletin}>
                        <RotateCcw size={15} /> Replay bulletin
                      </button>
                    )}
                    {scenario.id === 'overview' && (
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
    </aside>
  );
}
