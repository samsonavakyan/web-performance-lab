import { caseById } from './cases';
import type { AdvancedScenario, Mode } from './cases';
import { InstrumentMonitor } from '../workspaces/instrument-monitor/InstrumentMonitor';
import { OrderDesk } from '../workspaces/order-desk/OrderDesk';
import { InstrumentNavigator } from '../workspaces/instrument-switch/InstrumentNavigator';
import { TradeExport } from '../workspaces/trade-export/TradeExport';
import { LiveFeed } from '../workspaces/live-feed/LiveFeed';

export function AdvancedLab({ scenario, mode, onBack }: { scenario: AdvancedScenario; mode: Mode; onBack: () => void }) {
  return (
    <section className="panel workspace-page" aria-label="Advanced Lab">
      <div className="workspace-heading">
        <div>
          <h1>{caseById(scenario).title}</h1>
        </div>
        <button onClick={onBack}>Back to market</button>
      </div>
      <div className="workspace-content" key={`${scenario}-${mode}`}>
        {scenario === 'instrument-monitor' && <InstrumentMonitor />}
        {scenario === 'order-ticket' && <OrderDesk />}
        {scenario === 'instrument-switch' && <InstrumentNavigator />}
        {scenario === 'trade-export' && <TradeExport />}
        {scenario === 'live-feed' && <LiveFeed />}
      </div>
    </section>
  );
}
