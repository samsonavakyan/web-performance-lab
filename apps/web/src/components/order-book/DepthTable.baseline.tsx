import { memo, useEffect, useRef } from 'react';
import { money } from '../../lib/format';
import type { BookLevel } from '../../types';

const VISIBLE_LEVELS = 160;
const MAX_SIZE = 740;

type Props = { levels: BookLevel[]; seq: number };

export function DepthTable({ levels, seq }: Props) {
  const root = useRef<HTMLDivElement>(null);

  // Sizes the bid bars to the cell width on every book update.
  useEffect(() => {
    if (!root.current) return;
    const rows = root.current.querySelectorAll<HTMLElement>('[data-depth-row]');
    rows.forEach((row, i) => {
      const cell = row.querySelector<HTMLElement>('.depth-bid');
      const bar = row.querySelector<HTMLElement>('[data-depth-bar]');
      if (cell && bar && levels[i]) {
        bar.style.width = '0px';
        const width = cell.getBoundingClientRect().width;
        bar.style.width = `${(width * levels[i].bidSize) / MAX_SIZE}px`;
      }
    });
  }, [seq, levels]);

  return (
    <div className="depth-scroll" ref={root}>
      <DepthRows levels={levels} />
    </div>
  );
}

const DepthRows = memo(function DepthRows({ levels }: { levels: BookLevel[] }) {
  return (
    <>
      {levels.slice(0, VISIBLE_LEVELS).map((level) => (
        <div className="depth-row" data-depth-row key={level.id}>
          <div className="depth-cell depth-bid">
            <span className="depth-bar green" data-depth-bar />
            <span>{level.bidSize.toLocaleString()}</span>
          </div>
          <div className="depth-price">{money(level.bid)}</div>
          <div className="depth-cell depth-ask">
            <span className="depth-bar red" style={{ transform: `scaleX(${level.askSize / MAX_SIZE})` }} />
            <span>{level.askSize.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </>
  );
});
