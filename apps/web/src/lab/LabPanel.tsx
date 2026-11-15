import { ChevronRight, CircleHelp, FlaskConical, Pause, Play, RefreshCcw, RotateCcw, Timer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ADVANCED_CASES, CASES, isAdvanced } from './cases';
import type { Mode, Scenario } from './cases';
import type { Modes } from './modes';
import type { OverviewResponse } from '../api/client';
import { ModeSwitch } from './ModeSwitch';
import { setLabSlot } from './LabSlot';
import { setTimings, useTimings } from './timings';

// Opened one at a time: the learner tries on their own before each next hint.
const HINTS = [
  { key: 'steps', label: 'Reproduce' },
  { key: 'look', label: 'Where to look' },
  { key: 'notice', label: 'What to notice' },
  { key: 'code', label: 'Where in the code' },
  { key: 'solution', label: 'Solution' },
] as const;

type Props = {
  modes: Modes;
  overviewResponse: OverviewResponse;
  onOverviewResponseChange: (response: OverviewResponse) => void;
  activeScenario: Scenario | null;
  onModeChange: (id: Scenario, mode: Mode) => void;
  onReplayBulletin: () => void;
  onReloadOverview: () => void;
  onClose: () => void;
  onOpenGuide: () => void;
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
  onOpenGuide,
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
        <div className="lab-header-actions">
          <button className="icon-button" onClick={onOpenGuide} title="How the lab works">
            <CircleHelp size={20} />
          </button>
          <button className="icon-button" onClick={onClose} title="Close lab controls">
            <X size={20} />
          </button>
        </div>
      </div>
      <p className="lab-intro">Open a case, read the complaint and reproduce it. Record the same steps in Baseline and Optimized.</p>
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
              const number = String(index + 1).padStart(2, '0');
              const mode = modes[scenario.id];
              const title = (
                <>
                  <span className="scenario-number">{number}</span>
                  <div>
                    <strong>{scenario.title}</strong>
                    <small>{scenario.subtitle}</small>
                  </div>
                </>
              );
              if (!active) {
                return (
                  <div className="scenario" data-scenario={scenario.id} key={scenario.id}>
                    <button className="scenario-heading case-row" onClick={() => onOpenCase(scenario.id)} aria-label="Open case">
                      {title}
                      <span className={`mode-badge ${mode}`}>{mode === 'baseline' ? 'Baseline' : 'Optimized'}</span>
                      <ChevronRight size={16} className="case-row-chevron" />
                    </button>
                  </div>
                );
              }
              return (
                <div className="scenario active" data-scenario={scenario.id} key={scenario.id}>
                  <div className="scenario-heading">
                    {title}
                    <span className="case-current">Open</span>
                  </div>
                  <div className="case-body">
                    <details className="case-toggle" open>
                      <summary>
                        Complaint <span>· {scenario.complaint.from}</span>
                      </summary>
                      <blockquote>{scenario.complaint.text}</blockquote>
                    </details>
                    {HINTS.map(({ key, label }) => (
                      <details className={`case-toggle ${key === 'solution' ? 'solution' : ''}`} key={key}>
                        <summary>{label}</summary>
                        <p>{scenario[key]}</p>
                      </details>
                    ))}
                    <div className="case-field">
                      <span className="case-label">Mode</span>
                      <ModeSwitch mode={mode} onChange={(next) => onModeChange(scenario.id, next)} />
                    </div>
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
                    {scenario.id === 'overview' && (
                      <label className="case-field">
                        <span className="case-label">Response</span>
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
                    )}
                    {scenario.id === 'bulletin' && (
                      <button className="case-action" onClick={onReplayBulletin}>
                        <RotateCcw size={15} /> Replay bulletin
                      </button>
                    )}
                    {scenario.id === 'overview' && (
                      <button className="case-action" onClick={onReloadOverview}>
                        <RefreshCcw size={15} /> Reload overview
                      </button>
                    )}
                    {scenario.group === 'Advanced' && <div className="lab-slot" ref={setLabSlot} />}
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
