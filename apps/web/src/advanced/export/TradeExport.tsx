import { useState } from 'react';
import { LabSlot } from '../../lab/LabSlot';
import { ExportPanel } from '../../lab/variants';

export function TradeExport() {
  const [count, setCount] = useState(100_000);
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <>
      <LabSlot>
        <label className="checkbox" title="Downloads the CSV when the export finishes">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save file
        </label>
      </LabSlot>
      <ExportPanel count={count} save={save} onBusyChange={setBusy}>
        <label>
          Trades
          <select aria-label="Trades" disabled={busy} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={50000}>50,000</option>
            <option value={100000}>100,000</option>
            <option value={300000}>300,000</option>
          </select>
        </label>
      </ExportPanel>
      <label className="analysis-note">
        Comment <input aria-label="Export comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
    </>
  );
}
