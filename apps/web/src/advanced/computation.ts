export function makeSamples(size: number): Float64Array {
  const values = new Float64Array(size);
  let state = 2026;
  for (let i = 0; i < size; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    values[i] = (state >>> 0) / 4294967296;
  }
  return values;
}
export function calculateReport(values: Float64Array) {
  values.sort();
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
  return {
    count: values.length,
    mean: sum / values.length,
    median: values[Math.floor(values.length / 2)],
    p95: values[Math.floor(values.length * 0.95)],
  };
}
export type Report = ReturnType<typeof calculateReport>;
