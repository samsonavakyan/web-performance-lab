import type { ReactNode } from 'react';

export function download(blob: Blob, rows: number) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trades-${rows}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// children are the export options, shown in the same row as the export buttons.
export type ExportProps = { count: number; save: boolean; onBusyChange: (busy: boolean) => void; children: ReactNode };
