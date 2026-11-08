import { memo, useCallback, useEffect, useState } from 'react';
import { ADVANCED_SCENARIOS } from './types';
import type { AdvancedScenario, Scenario } from './types';
import { AdvancedLab } from './advanced/AdvancedLab';
import type { OverviewResponse } from './api/client';
import { WifiOff } from 'lucide-react';
import { ActivityPanel } from './components/activity/ActivityPanel';
import { Bulletin } from './components/chart/Bulletin';
import { ChartPanel } from './components/chart/ChartPanel';
import { Footer } from './components/layout/Footer';
import { Ticker } from './components/layout/Ticker';
import { TopBar } from './components/layout/TopBar';
import { MarketNews } from './components/news/MarketNews';
import { OrderBook } from './components/order-book/OrderBook';
import { MarketOverview } from './components/overview/MarketOverview';
import { Watchlist } from './components/watchlist/Watchlist';
import { useMarketData } from './hooks/useMarketData';
import { useQuoteStream } from './hooks/useQuoteStream';
import { LabPanel } from './lab/LabPanel';
import { ModesContext, useLabModes } from './lab/modes';

const StableAdvancedLab = memo(AdvancedLab);

// An open Advanced case is kept in the URL hash, so a browser reload reopens it.
function caseFromHash(): AdvancedScenario | null {
  const id = location.hash.slice(1);
  return (ADVANCED_SCENARIOS as readonly string[]).includes(id) ? (id as AdvancedScenario) : null;
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
    if ((ADVANCED_SCENARIOS as readonly Scenario[]).includes(id)) {
      setAdvanced(id as AdvancedScenario);
    } else {
      setAdvanced(null);
      setLocate(id);
    }
  }, []);
  useEffect(() => {
    if (!locate || advanced) return;
    const targets = {
      search: '.watchlist-panel',
      watchlist: '.watchlist-panel',
      layout: '.depth-panel',
      animation: '.chart-panel',
      shift: '.bulletin-slot',
      loading: '.overview-section',
    };
    const selector = targets[locate as keyof typeof targets];
    document.querySelector(selector)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setLocate(null);
  }, [locate, advanced]);
  const [selected, setSelected] = useState('NVDA');
  const [paused, setPaused] = useState(false);
  const [labOpen, setLabOpen] = useState(true);
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
          advancedOpen={advanced !== null}
          onTerminal={backToTerminal}
          onAdvanced={() => openCase(ADVANCED_SCENARIOS[0])}
          paused={paused}
          onTogglePause={() => setPaused((v) => !v)}
          labOpen={labOpen}
          onToggleLab={() => setLabOpen((v) => !v)}
        />
        <Ticker />

        <main className="terminal">
          <div className="terminal-content">
            {advanced ? (
              <StableAdvancedLab
                scenario={advanced}
                mode={modes[advanced]}
                onBack={backToTerminal}
              />
            ) : (
              <>
                <MarketOverview mode={modes.loading} reload={overviewReload} response={overviewResponse} />
                {error && (
                  <div className="error-banner">
                    <WifiOff size={16} /> API error: {error}. Start both apps with <code>npm run dev</code>.
                  </div>
                )}

                <Bulletin mode={modes.shift} replay={bulletinReplay} />

                <div className="workspace">
                  <Watchlist
                    instruments={instruments}
                    quotes={quotes}
                    selected={selected}
                    onSelect={setSelected}
                    mode={modes.watchlist}
                  />
                  <div className="center-column">
                    <ChartPanel
                      symbol={selected}
                      instrument={instrument}
                      candles={candles}
                      price={price}
                      change={change}
                      animationMode={modes.animation}
                    />
                    <div className="bottom-grid">
                      <MarketNews items={news} />
                      <ActivityPanel seq={seq} connected={connected} paused={paused} selected={selected} />
                    </div>
                  </div>
                  <OrderBook levels={levels} seq={seq} mode={modes.layout} symbol={selected} />
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
          />
        )}
      </div>
    </ModesContext.Provider>
  );
}
