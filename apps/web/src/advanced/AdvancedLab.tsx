import type { AdvancedScenario, Mode } from '../types';
import { SCENARIOS } from '../types';
import { QueryWorkspace } from './QueryWorkspace';
import { DeskPreferences } from './DeskPreferences';
import { PortfolioAnalysis } from './PortfolioAnalysis';
import { SavedSnapshot } from './SavedSnapshot';

export function AdvancedLab({
  scenario,
  mode,
  onBack,
  workload,
}: {
  scenario: AdvancedScenario;
  mode: Mode;
  onBack: () => void;
  workload: number;
}) {
  const info = SCENARIOS.find((s) => s.id === scenario)!;
  return (
    <section className="panel advanced-lab" aria-label="Advanced Lab">
      <div className="advanced-heading">
        <div>
          <h1>{info.title}</h1>
        </div>
        <button onClick={onBack}>Back to market</button>
      </div>
      <div className="advanced-content" key={`${scenario}-${mode}`}>
        {scenario === 'scheduling' && <QueryWorkspace mode={mode} workload={workload} />}
        {scenario === 'context' && <DeskPreferences mode={mode} />}
        {scenario === 'computation' && <PortfolioAnalysis mode={mode} />}
        {scenario === 'offline' && <SavedSnapshot mode={mode} />}
      </div>
    </section>
  );
}
