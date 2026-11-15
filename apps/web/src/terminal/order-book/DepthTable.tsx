import { memo } from 'react';
import { money } from '../../lib/format';
import type { BookLevel } from '../../types';

const VISIBLE_LEVELS = 160;
const MAX_SIZE = 740;

type Props = { levels: BookLevel[]; seq: number };

export function DepthTable({ levels }: Props) {
  return (
    <div className="depth-scroll">
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
            <span className="depth-bar green" style={{ transform: `scaleX(${level.bidSize / MAX_SIZE})` }} />
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
