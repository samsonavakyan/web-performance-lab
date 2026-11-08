import type { AdvancedScenario, Mode } from '../types';
import { SCENARIOS } from '../types';
import { InstrumentMonitor } from './leak/InstrumentMonitor';
import { OrderDesk } from './stream/OrderDesk';
import { InstrumentNavigator } from './navigation/InstrumentNavigator';
import { TradeExport } from './export/TradeExport';
import { LiveFeed } from './reconnect/LiveFeed';

export function AdvancedLab({ scenario, mode, onBack }: { scenario: AdvancedScenario; mode: Mode; onBack: () => void }) {
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
        {scenario === 'leak' && <InstrumentMonitor mode={mode} />}
        {scenario === 'stream' && <OrderDesk mode={mode} />}
        {scenario === 'navigation' && <InstrumentNavigator mode={mode} />}
        {scenario === 'export' && <TradeExport mode={mode} />}
        {scenario === 'reconnect' && <LiveFeed mode={mode} />}
      </div>
    </section>
  );
}
