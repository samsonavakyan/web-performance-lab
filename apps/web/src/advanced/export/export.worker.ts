import { CSV_HEADER, formatRowFast } from './csv';
import type { Trade } from './csv';

export type ExportRequest = { url: string };
export type ExportMessage =
  | { kind: 'progress'; done: number; total: number }
  | { kind: 'done'; blob: Blob; rows: number }
  | { kind: 'error'; message: string };

const post = (message: ExportMessage) => self.postMessage(message);

self.onmessage = async (event: MessageEvent<ExportRequest>) => {
  try {
    const response = await fetch(event.data.url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const trades = (await response.json()) as Trade[];
    const parts: string[] = [CSV_HEADER];
    const chunk: string[] = [];
    for (let i = 0; i < trades.length; i++) {
      chunk.push(formatRowFast(trades[i]));
      if (chunk.length === 10_000 || i === trades.length - 1) {
        parts.push(chunk.join('\n') + '\n');
        chunk.length = 0;
        post({ kind: 'progress', done: i + 1, total: trades.length });
      }
    }
    post({ kind: 'done', blob: new Blob(parts, { type: 'text/csv' }), rows: trades.length });
  } catch (error) {
    post({ kind: 'error', message: error instanceof Error ? error.message : 'Export failed' });
  }
};
