import { calculateReport } from './computation';
self.onmessage = (event: MessageEvent<{ id: number; buffer: ArrayBuffer }>) => {
  try {
    const started = performance.now();
    const report = calculateReport(new Float64Array(event.data.buffer));
    self.postMessage({ id: event.data.id, report, calculationMs: performance.now() - started });
  } catch {
    self.postMessage({ id: event.data.id, error: 'Report unavailable' });
  }
};
