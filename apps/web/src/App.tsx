import { createContext, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen, ChevronDown, CircleHelp, Clock3, ExternalLink, FlaskConical, Gauge, LayoutGrid, ListFilter, Pause, Play, Radio, RefreshCcw, RotateCcw, Search, Settings2, SlidersHorizontal, Star, TrendingUp, Wifi, WifiOff, X, } from 'lucide-react';
import type { BookLevel, Candle, Instrument, Mode, NewsItem, Overview, Quote, Scenario } from './types';
import { SCENARIOS } from './types';
type Modes = Record<Scenario, Mode>;
const initialModes: Modes = {
    search: 'optimized', watchlist: 'optimized', layout: 'optimized',
    animation: 'optimized', shift: 'optimized', loading: 'optimized',
};
const money = (price: number) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
async function request<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);
    return (await response.json()) as T;
}
function filterInstruments(items: Instrument[], query: string): Instrument[] {
    const needle = query.toLowerCase();
    if (!needle)
        return items;
    function editDistance(a: string, b: string): number {
        const row = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            let previous = row[0];
            row[0] = i;
            for (let j = 1; j <= b.length; j++) {
                const saved = row[j];
                row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
                previous = saved;
            }
        }
        return row[b.length];
    }
    return items.filter((item) => {
        const haystack = `${item.symbol} ${item.name}`.toLowerCase();
        for (let repeat = 0; repeat < 90; repeat++) {
            editDistance(haystack, needle);
        }
        return haystack.includes(needle);
    });
}
function Sparkline({ values, positive }: {
    values: number[];
    positive: boolean;
}) {
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    const points = values.map((v, index) => `${index * 3.6},${24 - ((v - min) / range) * 22}`).join(' ');
    return <svg viewBox="0 0 70 26" className={`sparkline ${positive ? 'positive' : 'negative'}`} aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}
const ROW_HEIGHT = 55;
function Watchlist({ instruments, quotes, quoteSeq, selected, select, mode, paused }: {
    instruments: Instrument[];
    quotes: Record<string, Quote>;
    quoteSeq: number;
    selected: string;
    select: (symbol: string) => void;
    mode: Mode;
    paused: boolean;
}) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'name' | 'change'>('name');
    const [scrollTop, setScrollTop] = useState(0);
    const deferredQuery = useDeferredValue(query);
    const [slowResults, setSlowResults] = useState<Instrument[] | null>(null);
    const searchMode = useModesContext().search;
    const onSearch = (next: string) => {
        setQuery(next);
        if (searchMode === 'baseline')
            setSlowResults(filterInstruments(instruments, next));
        else
            setSlowResults(null);
    };
    const filtered = useMemo(() => {
        const q = deferredQuery.toLowerCase().trim();
        const base = searchMode === 'baseline' && slowResults !== null ? slowResults : q
            ? instruments.filter((item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
            : instruments;
        if (sort === 'change')
            return [...base].sort((a, b) => (quotes[b.symbol]?.change ?? b.change) - (quotes[a.symbol]?.change ?? a.change));
        return base;
    }, [deferredQuery, instruments, quotes, searchMode, slowResults, sort]);
    void quoteSeq;
    void paused;
    const listHeight = 470;
    const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 4);
    const count = Math.ceil(listHeight / ROW_HEIGHT) + 8;
    const visible = mode === 'optimized' ? filtered.slice(first, first + count) : filtered;
    return <section className="panel watchlist-panel">
    <div className="panel-heading watchlist-heading"><div><h2>Watchlist</h2><p>Market universe · {instruments.length.toLocaleString()} symbols</p></div><button className="icon-button" title="Sort by daily change" onClick={() => setSort((v) => v === 'name' ? 'change' : 'name')}><ListFilter size={15}/></button></div>
    <div className="search-field"><Search size={16}/><input aria-label="Search symbols" placeholder="Search symbol or company" value={query} onChange={(e) => onSearch(e.target.value)}/><kbd>⌕</kbd></div>
    <div className="watchlist-table-head"><span>SYMBOL / COMPANY</span><span>LAST</span><span>CHG</span></div>
    <div className="watchlist-scroll" key={mode} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      {mode === 'optimized' ? <div style={{ height: filtered.length * ROW_HEIGHT, position: 'relative' }}>
        <div style={{ position: 'absolute', top: first * ROW_HEIGHT, width: '100%' }}>
          {visible.map((item) => <InstrumentRow key={item.symbol} item={item} quote={quotes[item.symbol]} selected={selected === item.symbol} onSelect={select}/>)}
        </div>
      </div> : visible.map((item) => <InstrumentRow key={item.symbol} item={item} quote={quotes[item.symbol]} selected={selected === item.symbol} onSelect={select}/>)}
      {!filtered.length && <div className="empty-state">No instruments found</div>}
    </div>
    <div className="watchlist-footer"><span className="status-dot"/> <span>Market watchlist</span><span>{filtered.length.toLocaleString()} results</span></div>
  </section>;
}
function InstrumentRow({ item, quote, selected, onSelect }: {
    item: Instrument;
    quote?: Quote;
    selected: boolean;
    onSelect: (symbol: string) => void;
}) {
    const change = quote?.change ?? item.change;
    return <button className={`instrument-row ${selected ? 'selected' : ''}`} onClick={() => onSelect(item.symbol)} title={`Open ${item.name}`}>
    <div className="instrument-identity"><div className="symbol-icon">{item.symbol.slice(0, 2)}</div><div><strong>{item.symbol}</strong><span>{item.name}</span></div></div>
    <div className="instrument-price"><strong>{money(quote?.price ?? item.price)}</strong><Sparkline values={item.sparkline} positive={change >= 0}/></div>
    <span className={`change-pill ${change >= 0 ? 'up' : 'down'}`}>{signed(change)}</span>
  </button>;
}
function CandlestickChart({ candles, symbol, mode, interval, change }: {
    candles: Candle[];
    symbol: string;
    mode: Mode;
    interval: string;
    change: number;
}) {
    const view = interval === '1D' ? candles.slice(-55) : interval === '1W' ? candles.slice(-100) : candles;
    const width = 900, height = 345, left = 28, top = 27, plotWidth = 825, plotHeight = 233;
    const high = Math.max(...view.map(x => x.high), 1) * 1.003;
    const low = Math.min(...view.map(x => x.low), 0) * .997;
    const valueY = (v: number) => top + (high - v) / (high - low) * plotHeight;
    const step = plotWidth / Math.max(view.length, 1);
    const current = view[view.length - 1];
    const maxVolume = Math.max(...view.map(c => c.volume), 1);
    return <div className="chart-wrap">
    <div className="chart-info"><div className="small-label">{symbol} / USD <span>•</span> LIVE MARKET</div><div className="chart-number">{current ? money(current.close) : '—'}<span className={change >= 0 ? 'txt-up' : 'txt-down'}>{signed(change)} <ArrowUpRight size={14}/></span></div><div className="ohlc">O <b>{money(current?.open ?? 0)}</b> &nbsp; H <b>{money(current?.high ?? 0)}</b> &nbsp; L <b>{money(current?.low ?? 0)}</b> &nbsp; C <b>{money(current?.close ?? 0)}</b></div></div>
    <svg viewBox={`0 0 ${width} ${height}`} className="candle-svg" role="img" aria-label={`${symbol} simulated candlestick price chart`}>
      {Array.from({ length: 6 }, (_, i) => { const y = top + (i * plotHeight / 5); const price = high - (i / 5) * (high - low); return <g key={i}><line x1={left} y1={y} x2="875" y2={y} className="grid-line"/><text x="880" y={y + 4} className="axis-label">{money(price)}</text></g>; })}
      {Array.from({ length: 9 }, (_, i) => { const x = left + i * (plotWidth / 8); return <g key={i}><line x1={x} y1={top} x2={x} y2="320" className="grid-line"/><text x={x} y="335" textAnchor="middle" className="axis-label">{String(8 + i).padStart(2, '0')}:00</text></g>; })}
      {view.map((c, i) => { const x = left + i * step + step / 2; const yOpen = valueY(c.open), yClose = valueY(c.close); const isUp = c.close >= c.open; const color = isUp ? '#17bf98' : '#e65d75'; const bodyWidth = Math.max(1.5, step * .58); const volH = c.volume / maxVolume * 56; return <g key={`${interval}-${i}`}><line x1={x} x2={x} y1={valueY(c.high)} y2={valueY(c.low)} stroke={color} strokeWidth="1.25"/><rect x={x - bodyWidth / 2} y={Math.min(yOpen, yClose)} width={bodyWidth} height={Math.max(1.35, Math.abs(yOpen - yClose))} fill={color} rx=".25"/><rect x={x - bodyWidth / 2} y={319 - volH} width={bodyWidth} height={volH} fill={color} opacity=".23"/></g>; })}
      {current && <g><line x1={left} y1={valueY(current.close)} x2="853" y2={valueY(current.close)} stroke="#d5b76c" strokeWidth=".75" strokeDasharray="4 5"/><rect x="853" y={valueY(current.close) - 10} width="45" height="20" rx="3" fill="#d5b76c"/><text x="858" y={valueY(current.close) + 3.7} className="last-price">{money(current.close)}</text></g>}
    </svg>
    <div className={`scanner-track ${mode}`} aria-hidden="true"><span className="scanner-label">MARKET SCAN</span><div className="scanner-line"><span className="scanner-marker"/></div></div>
  </div>;
}
function OrderBook({ levels, seq, mode, symbol }: {
    levels: BookLevel[];
    seq: number;
    mode: Mode;
    symbol: string;
}) {
    const root = useRef<HTMLDivElement>(null);
    const [tab, setTab] = useState<'book' | 'trades'>('book');
    useEffect(() => {
        if (mode !== 'baseline' || tab !== 'book' || !root.current)
            return;
        // Forced synchronous layout: alternating geometry reads and inline writes for each bar.
        const rows = root.current.querySelectorAll<HTMLElement>('[data-depth-row]');
        rows.forEach((row, i) => {
            const width = row.getBoundingClientRect().width;
            const bar = row.querySelector<HTMLElement>('[data-depth-bar]');
            if (bar)
                bar.style.width = `${Math.min(85, (width % 103) / 2 + (i * 19 + seq) % 60)}%`;
            row.style.paddingLeft = `${(seq + i) % 3 + 9}px`;
        });
    }, [seq, mode, tab]);
    const shown = levels.slice(0, 56);
    return <section className="panel depth-panel"><div className="panel-heading"><div><h2>Order book</h2><p>{symbol} · Level II depth</p></div><Settings2 size={16} className="muted-icon"/></div>
    <div className="book-tabs"><button className={tab === 'book' ? 'active' : ''} onClick={() => setTab('book')}>Order Book</button><button className={tab === 'trades' ? 'active' : ''} onClick={() => setTab('trades')}>Recent Trades</button></div>
    {tab === 'book' ? <><div className="depth-columns"><span>BID SIZE</span><span>PRICE (USD)</span><span>ASK SIZE</span></div><div className="depth-scroll" ref={root}>{shown.map((level) => <div className="depth-row" data-depth-row key={level.id}>
      <div className="depth-cell depth-bid"><span className="depth-bar green" data-depth-bar style={mode === 'optimized' ? { transform: `scaleX(${level.bidSize / 740})` } : undefined}/><span>{level.bidSize.toLocaleString()}</span></div>
      <div className="depth-price">{money((level.bid + level.ask) / 2)}</div>
      <div className="depth-cell depth-ask"><span className="depth-bar red" style={{ transform: `scaleX(${level.askSize / 740})` }}/><span>{level.askSize.toLocaleString()}</span></div>
    </div>)}</div><div className="spread"><span>Spread</span><strong>0.04 USD</strong><span>0.03%</span></div></> : <div className="trades-list">{levels.slice(0, 17).map((level, i) => <div className="trade-row" key={level.id}><span>10:{String(42 - i).padStart(2, '0')}:{String(58 - i).padStart(2, '0')}</span><strong className={i % 3 === 0 ? 'txt-down' : 'txt-up'}>{money(i % 2 ? level.ask : level.bid)}</strong><span>{(level.askSize / 100).toFixed(2)}</span></div>)}</div>}
  </section>;
}
function Bulletin({ mode, replay }: {
    mode: Mode;
    replay: number;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setVisible(false); const timer = window.setTimeout(() => setVisible(true), 2300); return () => window.clearTimeout(timer); }, [mode, replay]);
    return <div className={`bulletin-slot ${mode}`}>{visible && <div className="market-bulletin"><div className="bulletin-emblem"><Bell size={18}/></div><div><strong>MARKET NOTICE · SIMULATED</strong><p>Upcoming economic data may increase volatility across major indices.</p></div><span>JUST NOW</span></div>}{!visible && mode === 'optimized' && <div className="bulletin-placeholder" aria-hidden="true"/>}</div>;
}
function MarketOverview({ mode, reload }: {
    mode: Mode;
    reload: number;
}) {
    const [data, setData] = useState<Overview | null>(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => { const controller = new AbortController(); setPending(true); setData(null); setError(''); fetch(`/api/overview?mode=${mode}`, { signal: controller.signal }).then(r => { if (!r.ok)
        throw Error('Overview unavailable'); return r.json() as Promise<Overview>; }).then(r => { setData(r); setPending(false); }).catch(e => { if ((e as Error).name !== 'AbortError') {
        setError('Overview unavailable');
        setPending(false);
    } }); return () => controller.abort(); }, [mode, reload]);
    return <div className="overview-strip"><div className="overview-title"><span className="eyebrow">MARKET SNAPSHOT</span><strong>{pending ? 'Loading market pulse…' : error || data?.title}</strong><small>{pending ? 'Fetching synthetic overview' : 'SYNTHETIC DATA · NOT LIVE MARKETS'}</small></div><div className="overview-items">{pending ? Array.from({ length: 4 }, (_, i) => <span key={i} className="overview-skeleton"/>) : data?.highlights.map(item => <div className="overview-item" key={item.symbol}><span>{item.symbol}</span><strong>{money(item.price)}</strong><small className={item.change >= 0 ? 'txt-up' : 'txt-down'}>{signed(item.change)}</small></div>)}</div></div>;
}
// Shared mode context is deliberately local to this demo; controls are not a production feature.
const ModeContext = createContext<Modes>(initialModes);
function useModesContext() { return useContext(ModeContext); }
function LabPanel({ modes, update, replayShift, reloadOverview, close }: {
    modes: Modes;
    update: (id: Scenario, mode: Mode) => void;
    replayShift: () => void;
    reloadOverview: () => void;
    close: () => void;
}) {
    return <aside className="lab-panel"><div className="lab-header"><div className="lab-title"><FlaskConical size={19}/><div><h2>Performance Lab</h2><span>Reproducible scenarios</span></div></div><button className="icon-button" onClick={close} title="Close lab controls"><X size={18}/></button></div>
    <div className="lab-intro"><span className="simulation-dot"/> All prices and events are simulated. Toggle one scenario at a time and record a trace in Chrome DevTools.</div>
    <div className="scenario-list">{SCENARIOS.map((scenario, index) => <div className="scenario" key={scenario.id}><div className="scenario-heading"><span className="scenario-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{scenario.title}</strong><small>{scenario.subtitle}</small></div><span className="scenario-area">{scenario.area}</span></div><div className="scenario-buttons"><button className={modes[scenario.id] === 'baseline' ? 'selected bad' : ''} onClick={() => update(scenario.id, 'baseline')}>Baseline</button><button className={modes[scenario.id] === 'optimized' ? 'selected good' : ''} onClick={() => update(scenario.id, 'optimized')}>Optimized</button></div><p className="scenario-hint">{scenario.hint}</p>{scenario.id === 'shift' && <button className="replay" onClick={replayShift}><RotateCcw size={13}/> Replay bulletin</button>}{scenario.id === 'loading' && <button className="replay" onClick={reloadOverview}><RefreshCcw size={13}/> Reload overview</button>}</div>)}</div>
    <div className="lab-bottom"><a href="https://developer.chrome.com/docs/devtools/performance/overview/" target="_blank" rel="noreferrer"><BookOpen size={14}/> Performance documentation <ExternalLink size={12}/></a><span>CHROME DEVTOOLS → PERFORMANCE</span></div>
  </aside>;
}
function MarketNews({ items }: {
    items: NewsItem[];
}) {
    return <section className="panel news-panel"><div className="panel-heading"><div><h2>Market briefing</h2><p>Simulated headlines · education only</p></div><ArrowRight size={16} className="muted-icon"/></div><div className="news-list">{items.map(item => <div className="news-item" key={item.id}><div><span>{item.category}</span><time>{item.time}</time></div><strong>{item.title}</strong><small>{item.source}</small></div>)}</div></section>;
}
function ActivityPanel({ seq, connected, paused, selected }: {
    seq: number;
    connected: boolean;
    paused: boolean;
    selected: string;
}) {
    return <section className="panel activity-panel"><div className="panel-heading"><div><h2>Session activity</h2><p>Synthetic quote stream</p></div><Activity size={16} className="muted-icon"/></div><div className="activity-rows"><div><span>Connection</span><strong className={connected ? 'txt-up' : 'txt-down'}>{connected ? 'Connected' : 'Disconnected'}</strong></div><div><span>Stream</span><strong>{paused ? 'Paused' : 'Receiving quotes'}</strong></div><div><span>Messages</span><strong>{seq.toLocaleString()}</strong></div><div><span>Selected</span><strong>{selected}</strong></div><div><span>Update interval</span><strong>700 ms</strong></div></div><div className="activity-foot"><span className="status-dot"/> Research environment · no orders can be placed</div></section>;
}
export default function App() {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [candles, setCandles] = useState<Candle[]>([]);
    const [levels, setLevels] = useState<BookLevel[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [quotes, setQuotes] = useState<Record<string, Quote>>({});
    const [seq, setSeq] = useState(0);
    const [connected, setConnected] = useState(false);
    const [paused, setPaused] = useState(false);
    const pausedRef = useRef(false);
    const [selected, setSelected] = useState('NVDA');
    const [interval, setInterval] = useState('1W');
    const [modes, setModes] = useState<Modes>(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem('marketlab-modes') || '{}') as Partial<Modes>;
            const result = { ...initialModes };
            for (const key of Object.keys(initialModes) as Scenario[]) {
                if (saved[key] === 'baseline' || saved[key] === 'optimized')
                    result[key] = saved[key];
            }
            return result;
        }
        catch {
            return initialModes;
        }
    });
    const [labOpen, setLabOpen] = useState(true);
    const [shiftReplay, setShiftReplay] = useState(0);
    const [overviewReload, setOverviewReload] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [favorite, setFavorite] = useState(false);
    useEffect(() => { pausedRef.current = paused; }, [paused]);
    useEffect(() => { sessionStorage.setItem('marketlab-modes', JSON.stringify(modes)); }, [modes]);
    useEffect(() => { let active = true; Promise.all([request<Instrument[]>('/api/instruments'), request<NewsItem[]>('/api/news')]).then(([inst, n]) => { if (active) {
        setInstruments(inst);
        setNews(n);
    } }).catch((e: Error) => { if (active)
        setError(e.message); }); return () => { active = false; }; }, []);
    useEffect(() => { let active = true; Promise.all([request<Candle[]>(`/api/history/${selected}`), request<BookLevel[]>(`/api/orderbook/${selected}`)]).then(([c, b]) => { if (active) {
        setCandles(c);
        setLevels(b);
    } }).catch((e: Error) => { if (active)
        setError(e.message); }); return () => { active = false; }; }, [selected]);
    useEffect(() => { const protocol = location.protocol === 'https:' ? 'wss' : 'ws'; const socket = new WebSocket(`${protocol}://${location.host}/ws/quotes`); socket.onopen = () => setConnected(true); socket.onclose = () => setConnected(false); socket.onerror = () => setConnected(false); socket.onmessage = (event) => { const msg = JSON.parse(String(event.data)) as {
        kind: string;
        seq?: number;
        updates?: Quote[];
    }; if (msg.kind === 'quotes' && !pausedRef.current && msg.updates) {
        setSeq(msg.seq ?? 0);
        setQuotes(previous => { const next = { ...previous }; for (const item of msg.updates ?? [])
            next[item.symbol] = item; return next; });
    } }; return () => socket.close(); }, []);
    const current = instruments.find(item => item.symbol === selected);
    const price = quotes[selected]?.price ?? current?.price ?? 0;
    const change = quotes[selected]?.change ?? current?.change ?? 0;
    const setMode = (id: Scenario, mode: Mode) => setModes(previous => ({ ...previous, [id]: mode }));
    return <ModeContext.Provider value={modes}><div className={`app-shell ${labOpen ? 'with-lab' : ''}`}>
    <header className="topbar"><div className="brand"><span className="brand-mark"><BarChart3 size={19}/></span><span>MARKET<span>LAB</span></span><span className="brand-sep"/><span className="app-label">Trading Terminal</span></div><nav className="main-nav"><span className="nav-active"><LayoutGrid size={15}/> Terminal</span><span><TrendingUp size={15}/> Markets</span><span><Gauge size={15}/> Analytics</span></nav><div className="header-actions"><span className="market-open"><span className="status-dot"/> SIMULATED MARKET</span><button className="button minor" onClick={() => setPaused(v => !v)}>{paused ? <Play size={14}/> : <Pause size={14}/>} {paused ? 'Resume' : 'Pause'} stream</button><button className={`button lab-toggle ${labOpen ? 'active' : ''}`} onClick={() => setLabOpen(v => !v)}><FlaskConical size={15}/> Performance Lab</button></div></header>
    <div className="top-ticker"><div className="ticker-message"><Radio size={13}/><span>SIMULATED FEED</span></div>{['SPX 5,846.21', 'NDX 20,741.58', 'DJI 42,462.33', 'VIX 14.79', 'DXY 103.24', 'BTC $67,482.10'].map((item, i) => <div className="ticker-item" key={item}><span>{item}</span><span className={i % 3 === 0 ? 'txt-down' : 'txt-up'}>{i % 3 === 0 ? <ArrowDownRight size={12}/> : <ArrowUpRight size={12}/>} {i % 3 === 0 ? '0.28' : '1.32'}%</span></div>)}</div>
    <main className="terminal"><div className="terminal-content"><MarketOverview mode={modes.loading} reload={overviewReload}/>{error && <div className="error-banner"><WifiOff size={16}/> API error: {error}. Start both apps with <code>npm run dev</code>.</div>}
      <div className="workspace"><Watchlist instruments={instruments} quotes={quotes} quoteSeq={seq} selected={selected} select={setSelected} mode={modes.watchlist} paused={paused}/><div className="center-column"><Bulletin mode={modes.shift} replay={shiftReplay}/><section className="panel chart-panel"><div className="chart-header"><div className="chart-symbol"><span className="chart-symbol-icon">{selected.slice(0, 2)}</span><div><h2>{current?.name ?? selected} <ChevronDown size={15}/></h2><p>NASDAQ · USD · Simulated market</p></div><button className={`icon-button ${favorite ? 'is-favorite' : ''}`} onClick={() => setFavorite(v => !v)} title="Toggle favorite"><Star size={16} fill={favorite ? 'currentColor' : 'none'}/></button></div><div className="chart-actions"><span className="live-tag"><span className="status-dot"/> LIVE</span><div className="intervals">{['1D', '1W', '1M'].map(value => <button key={value} onClick={() => setInterval(value)} className={interval === value ? 'active' : ''}>{value}</button>)}</div><SlidersHorizontal size={16} className="muted-icon"/></div></div><CandlestickChart candles={candles} symbol={selected} mode={modes.animation} interval={interval} change={change}/><div className="chart-bottom"><div><span>MARKET PRICE</span><strong>{money(price)} USD</strong></div><div><span>24H CHANGE</span><strong className={change >= 0 ? 'txt-up' : 'txt-down'}>{signed(change)}</strong></div><div><span>VOLUME (24H)</span><strong>{((current?.volume ?? 0) / 1000000).toFixed(2)}M</strong></div><div><span>MARKET STATUS</span><strong className="txt-up">Simulation</strong></div></div></section><div className="bottom-grid"><MarketNews items={news}/><ActivityPanel seq={seq} connected={connected} paused={paused} selected={selected}/></div></div><OrderBook levels={levels} seq={seq} mode={modes.layout} symbol={selected}/></div>
      <footer className="terminal-footer"><div><span className="status-dot"/>{connected ? 'Connected to simulated exchange' : 'Connecting to local API'}<span className="footer-divider"/><Wifi size={12}/> WS / 700ms</div><div><Clock3 size={12}/> Local performance testbed <span className="footer-divider"/> No real trading · No financial advice</div><div><CircleHelp size={13}/> DevTools → Performance</div></footer></div></main>
    {labOpen && <LabPanel modes={modes} update={setMode} replayShift={() => setShiftReplay(v => v + 1)} reloadOverview={() => setOverviewReload(v => v + 1)} close={() => setLabOpen(false)}/>}
  </div></ModeContext.Provider>;
}
