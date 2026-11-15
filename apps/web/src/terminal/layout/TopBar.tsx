import { BarChart3, FlaskConical, LayoutGrid, Layers } from 'lucide-react';

type Props = {
  labOpen: boolean;
  isWorkspaceOpen: boolean;
  onTerminal: () => void;
  onWorkspaces: () => void;
  onToggleLab: () => void;
};

export function TopBar({ labOpen, onToggleLab, isWorkspaceOpen, onTerminal, onWorkspaces }: Props) {
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
        <button className={!isWorkspaceOpen ? 'nav-active' : ''} onClick={onTerminal}>
          <LayoutGrid size={16} /> Market
        </button>
        <button className={isWorkspaceOpen ? 'nav-active' : ''} onClick={onWorkspaces}>
          <Layers size={16} /> Workspaces
        </button>
      </nav>
      <div className="header-actions">
        <span className="market-open">
          <span className="status-dot" /> MARKET OPEN
        </span>
        <button className={`button lab-toggle ${labOpen ? 'active' : ''}`} onClick={onToggleLab}>
          <FlaskConical size={15} /> Performance Lab
        </button>
      </div>
    </header>
  );
}
