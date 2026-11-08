import { BarChart3, FlaskConical, LayoutGrid, Layers, Pause, Play } from 'lucide-react';

type Props = {
  paused: boolean;
  onTogglePause: () => void;
  labOpen: boolean;
  advancedOpen: boolean;
  onTerminal: () => void;
  onAdvanced: () => void;
  onToggleLab: () => void;
};

export function TopBar({ paused, onTogglePause, labOpen, onToggleLab, advancedOpen, onTerminal, onAdvanced }: Props) {
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
      <nav className="main-nav" aria-label="Workspace">
        <button className={!advancedOpen ? 'nav-active' : ''} onClick={onTerminal}>
          <LayoutGrid size={16} /> Market
        </button>
        <button className={advancedOpen ? 'nav-active' : ''} onClick={onAdvanced}>
          <Layers size={16} /> Workspaces
        </button>
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
