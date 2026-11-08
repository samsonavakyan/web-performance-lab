import { createContext, memo, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Mode } from '../types';

type Appearance = 'Night' | 'Day';
const DeskContext = createContext({ appearance: 'Night' as Appearance, tick: 0 });
const AppearanceContext = createContext<Appearance>('Night');
const FeedContext = createContext(0);

function DeskCard({ index, appearance }: { index: number; appearance: Appearance }) {
  const element = useRef<HTMLDivElement>(null);
  const commits = useRef(0);
  useLayoutEffect(() => {
    if (element.current) element.current.dataset.commits = String(++commits.current);
  });
  let value = index;
  for (let i = 0; i < 12000; i++) value += Math.sin(i + index);
  return (
    <div ref={element} className={`desk-card ${appearance.toLowerCase()}`}>
      <strong>Desk {index + 1}</strong>
      <span>
        {appearance} · {value.toFixed(3)}
      </span>
    </div>
  );
}
const CombinedCard = memo(function CombinedCard({ index }: { index: number }) {
  const { appearance } = useContext(DeskContext);
  return <DeskCard index={index} appearance={appearance} />;
});
const AppearanceCard = memo(function AppearanceCard({ index }: { index: number }) {
  const appearance = useContext(AppearanceContext);
  return <DeskCard index={index} appearance={appearance} />;
});
const DeskGrid = memo(function DeskGrid({ mode }: { mode: Mode }) {
  const Card = mode === 'baseline' ? CombinedCard : AppearanceCard;
  return (
    <div className="desk-grid">
      {Array.from({ length: 48 }, (_, index) => (
        <Card key={index} index={index} />
      ))}
    </div>
  );
});
function CombinedFeed() {
  return <output aria-label="Feed sequence">{useContext(DeskContext).tick}</output>;
}
function SeparateFeed() {
  return <output aria-label="Feed sequence">{useContext(FeedContext)}</output>;
}
export function DeskPreferences({ mode }: { mode: Mode }) {
  const [appearance, setAppearance] = useState<Appearance>('Night');
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    let steps = 0;
    const timer = window.setInterval(() => {
      setTick((t) => t + 1);
      if (++steps === 20) {
        clearInterval(timer);
        setRunning(false);
      }
    }, 150);
    return () => clearInterval(timer);
  }, [running]);
  const content = (
    <>
      <div className="advanced-controls">
        <button disabled={running} onClick={() => setRunning(true)}>
          Run feed
        </button>
        <button onClick={() => setAppearance((a) => (a === 'Night' ? 'Day' : 'Night'))}>Change appearance</button>
        <span>Feed sequence: {mode === 'baseline' ? <CombinedFeed /> : <SeparateFeed />}</span>
        <span role="status">{running ? 'Running' : 'Ready'}</span>
      </div>
      <DeskGrid mode={mode} />
    </>
  );
  return mode === 'baseline' ? (
    <DeskContext.Provider value={{ appearance, tick }}>{content}</DeskContext.Provider>
  ) : (
    <AppearanceContext.Provider value={appearance}>
      <FeedContext.Provider value={tick}>{content}</FeedContext.Provider>
    </AppearanceContext.Provider>
  );
}
