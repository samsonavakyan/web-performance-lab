import { memo, useCallback, useEffect, useState } from 'react';
import { AdvancedLab } from './lab/AdvancedLab';
import type { OverviewResponse } from './api/client';
import { WifiOff } from 'lucide-react';
import { ActivityPanel } from './terminal/activity/ActivityPanel';
import { ChartPanel } from './terminal/chart/ChartPanel';
import { Footer } from './terminal/layout/Footer';
import { Ticker } from './terminal/layout/Ticker';
import { TopBar } from './terminal/layout/TopBar';
import { MarketNews } from './terminal/news/MarketNews';
import { OrderBook } from './terminal/order-book/OrderBook';
import { Watchlist } from './terminal/watchlist/Watchlist';
import { useMarketData } from './hooks/useMarketData';
import { useQuoteStream } from './hooks/useQuoteStream';
import { ADVANCED_CASES, caseById, isAdvanced } from './lab/cases';
import type { AdvancedScenario, Scenario } from './lab/cases';
import { LabPanel } from './lab/LabPanel';
import { isOnboardingDone, Onboarding } from './lab/Onboarding';
import { ModesContext, useLabModes } from './lab/modes';
import { Bulletin, MarketOverview } from './lab/variants';

const StableAdvancedLab = memo(AdvancedLab);

// An open Advanced case is kept in the URL hash, so a browser reload reopens it.
function caseFromHash(): AdvancedScenario | null {
  const id = location.hash.slice(1);

  return isAdvanced(id) ? id : null;
}

export default function App() {
  const [advanced, setAdvanced] = useState<AdvancedScenario | null>(caseFromHash);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(caseFromHash);
  const [locate, setLocate] = useState<Scenario | null>(null);

  useEffect(() => {
    history.replaceState(null, '', advanced ? `#${advanced}` : location.pathname);
  }, [advanced]);

  const backToTerminal = useCallback(() => {
    setAdvanced(null);
    setActiveScenario(null);
  }, []);

  const openCase = useCallback((id: Scenario) => {
    setActiveScenario(id);
    if (isAdvanced(id)) {
      setAdvanced(id);
    } else {
      setAdvanced(null);
      setLocate(id);
    }
  }, []);

  useEffect(() => {
    if (!locate || advanced) return;

    const selector = caseById(locate).target;
    if (selector) document.querySelector(selector)?.scrollIntoView({ block: 'center', behavior: 'smooth' });

    setLocate(null);
  }, [locate, advanced]);

  const [selected, setSelected] = useState('NVDA');
  const [paused, setPaused] = useState(false);
  const [labOpen, setLabOpen] = useState(true);
  const [isGuideOpen, setGuideOpen] = useState(() => !isOnboardingDone());
  const [bulletinReplay, setBulletinReplay] = useState(0);
  const [overviewReload, setOverviewReload] = useState(0);
  const [overviewResponse, setOverviewResponse] = useState<OverviewResponse>('normal');

  const [modes, setMode] = useLabModes();

  const { instruments, news, candles, levels, error } = useMarketData(selected);

  // The terminal stream is paused while an Advanced case is open, so it does not add renders to its profiles.
  const { quotes, seq, connected } = useQuoteStream(paused || advanced !== null);

  const instrument = instruments.find((item) => item.symbol === selected);
  const price = quotes[selected]?.price ?? instrument?.price ?? 0;
  const change = quotes[selected]?.change ?? instrument?.change ?? 0;

  return (
    <ModesContext.Provider value={modes}>
      <div className={`app-shell ${labOpen ? 'with-lab' : ''}`}>
        <TopBar
          isWorkspaceOpen={advanced !== null}
          onTerminal={backToTerminal}
          onWorkspaces={() => openCase(ADVANCED_CASES[0])}
          labOpen={labOpen}
          onToggleLab={() => setLabOpen((v) => !v)}
        />
        <Ticker />

        <main className="terminal">
          <div className="terminal-content">
            {advanced ? (
              <StableAdvancedLab scenario={advanced} mode={modes[advanced]} onBack={backToTerminal} />
            ) : (
              <>
                <MarketOverview reload={overviewReload} response={overviewResponse} />
                {error && (
                  <div className="error-banner">
                    <WifiOff size={16} /> API error: {error}. Start both apps with <code>npm run dev</code>.
                  </div>
                )}

                <Bulletin replay={bulletinReplay} />

                <div className="workspace">
                  {/* Search is a hook variant, so a mode change remounts the watchlist. */}
                  <Watchlist
                    key={modes.search}
                    instruments={instruments}
                    quotes={quotes}
                    selected={selected}
                    onSelect={setSelected}
                  />
                  <div className="center-column">
                    <ChartPanel
                      symbol={selected}
                      instrument={instrument}
                      instruments={instruments}
                      onSelect={setSelected}
                      candles={candles}
                      price={price}
                      change={change}
                    />
                    <div className="bottom-grid">
                      <MarketNews items={news} />
                      <ActivityPanel seq={seq} connected={connected} paused={paused} selected={selected} />
                    </div>
                  </div>
                  <OrderBook levels={levels} seq={seq} symbol={selected} />
                </div>

                <Footer connected={connected} />
              </>
            )}
          </div>
        </main>

        {labOpen && (
          <LabPanel
            overviewResponse={overviewResponse}
            onOverviewResponseChange={setOverviewResponse}
            activeScenario={activeScenario}
            onOpenCase={openCase}
            modes={modes}
            onModeChange={setMode}
            onReplayBulletin={() => setBulletinReplay((v) => v + 1)}
            onReloadOverview={() => setOverviewReload((v) => v + 1)}
            onClose={() => setLabOpen(false)}
            onOpenGuide={() => setGuideOpen(true)}
            streamPaused={paused}
            onToggleStream={() => setPaused((v) => !v)}
          />
        )}
        <Onboarding isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
      </div>
    </ModesContext.Provider>
  );
}
