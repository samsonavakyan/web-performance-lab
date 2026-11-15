import { caseById } from '../lab/cases';
import type { AdvancedScenario, Mode } from '../lab/cases';
import { InstrumentMonitor } from './leak/InstrumentMonitor';
import { OrderDesk } from './stream/OrderDesk';
import { InstrumentNavigator } from './navigation/InstrumentNavigator';
import { TradeExport } from './export/TradeExport';
import { LiveFeed } from './reconnect/LiveFeed';

export function AdvancedLab({ scenario, mode, onBack }: { scenario: AdvancedScenario; mode: Mode; onBack: () => void }) {
  return (
    <section className="panel advanced-lab" aria-label="Advanced Lab">
      <div className="advanced-heading">
        <div>
          <h1>{caseById(scenario).title}</h1>
        </div>
        <button onClick={onBack}>Back to market</button>
      </div>
      <div className="advanced-content" key={`${scenario}-${mode}`}>
        {scenario === 'leak' && <InstrumentMonitor />}
        {scenario === 'stream' && <OrderDesk />}
        {scenario === 'navigation' && <InstrumentNavigator />}
        {scenario === 'export' && <TradeExport />}
        {scenario === 'reconnect' && <LiveFeed />}
      </div>
    </section>
  );
}
