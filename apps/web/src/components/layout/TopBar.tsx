import { BarChart3, FlaskConical, Gauge, LayoutGrid, Pause, Play, TrendingUp } from 'lucide-react';

type Props = {
  paused: boolean;
  onTogglePause: () => void;
  labOpen: boolean;
  onToggleLab: () => void;
};

export function TopBar({ paused, onTogglePause, labOpen, onToggleLab }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <BarChart3 size={19} />
        </span>
        <span>
          MARKET<span>LAB</span>
        </span>
        <span className="brand-sep" />
        <span className="app-label">Trading Terminal</span>
      </div>
      <nav className="main-nav">
        <span className="nav-active">
          <LayoutGrid size={15} /> Terminal
        </span>
        <span>
          <TrendingUp size={15} /> Markets
        </span>
        <span>
          <Gauge size={15} /> Analytics
        </span>
      </nav>
      <div className="header-actions">
        <span className="market-open">
          <span className="status-dot" /> MARKET OPEN
        </span>
        <button className="button minor" onClick={onTogglePause}>
          {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'} stream
        </button>
        <button className={`button lab-toggle ${labOpen ? 'active' : ''}`} onClick={onToggleLab}>
          <FlaskConical size={15} /> Performance Lab
        </button>
      </div>
    </header>
  );
}
