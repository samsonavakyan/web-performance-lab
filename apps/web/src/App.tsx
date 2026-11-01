import { useState } from 'react';
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

export default function App() {
  const [selected, setSelected] = useState('NVDA');
  const [paused, setPaused] = useState(false);
  const [labOpen, setLabOpen] = useState(true);
  const [bulletinReplay, setBulletinReplay] = useState(0);
  const [overviewReload, setOverviewReload] = useState(0);
  const [modes, setMode] = useLabModes();

  const { instruments, news, candles, levels, error } = useMarketData(selected);
  const { quotes, seq, connected } = useQuoteStream(paused);

  const instrument = instruments.find((item) => item.symbol === selected);
  const price = quotes[selected]?.price ?? instrument?.price ?? 0;
  const change = quotes[selected]?.change ?? instrument?.change ?? 0;

  return (
    <ModesContext.Provider value={modes}>
      <div className={`app-shell ${labOpen ? 'with-lab' : ''}`}>
        <TopBar
          paused={paused}
          onTogglePause={() => setPaused((v) => !v)}
          labOpen={labOpen}
          onToggleLab={() => setLabOpen((v) => !v)}
        />
        <Ticker />

        <main className="terminal">
          <div className="terminal-content">
            <MarketOverview mode={modes.loading} reload={overviewReload} />
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
          </div>
        </main>

        {labOpen && (
          <LabPanel
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
