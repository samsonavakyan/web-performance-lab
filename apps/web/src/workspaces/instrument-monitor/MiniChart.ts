import type { Candle } from '../../types';

type Point = { y: number; average: number; band: number };

const HISTORY_POINTS = 40_000;
const WINDOW = 30;

// Minimal canvas chart with an API similar to common chart libraries.
export class MiniChart {
  private points: Point[];
  private readonly onResize = () => this.draw();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    candles: Candle[],
  ) {
    const closes = candles.map((candle) => candle.close);
    this.points = Array.from({ length: HISTORY_POINTS }, (_, index) => ({
      y: closes[(index + closes.length - (HISTORY_POINTS % closes.length)) % closes.length],
      average: 0,
      band: 0,
    }));
    window.addEventListener('resize', this.onResize);
    this.recalculate();
    this.draw();
  }

  update(price: number) {
    this.points.shift();
    this.points.push({ y: price, average: 0, band: 0 });
    this.recalculate();
    this.draw();
  }

  // Moving average and volatility band over the full history.
  private recalculate() {
    for (let i = 0; i < this.points.length; i++) {
      const from = Math.max(0, i - WINDOW + 1);
      let sum = 0;
      for (let j = from; j <= i; j++) sum += this.points[j].y;
      const average = sum / (i - from + 1);
      let variance = 0;
      for (let j = from; j <= i; j++) variance += (this.points[j].y - average) ** 2;
      this.points[i].average = average;
      this.points[i].band = 2 * Math.sqrt(variance / (i - from + 1));
    }
  }

  draw() {
    const context = this.canvas.getContext('2d');
    if (!context) return;
    const width = (this.canvas.width = this.canvas.clientWidth || 640);
    const height = (this.canvas.height = this.canvas.clientHeight || 220);
    const visible = this.points.slice(-120);
    const min = Math.min(...visible.map((point) => point.average - point.band));
    const max = Math.max(...visible.map((point) => point.average + point.band));
    const range = max - min || 1;
    const line = (value: (point: Point) => number, color: string, lineWidth: number) => {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.beginPath();
      visible.forEach((point, index) => {
        const x = (index / (visible.length - 1)) * width;
        const y = height - ((value(point) - min) / range) * (height - 16) - 8;
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      });
      context.stroke();
    };
    context.clearRect(0, 0, width, height);
    line((point) => point.average + point.band, '#cbd5e1', 1);
    line((point) => point.average - point.band, '#cbd5e1', 1);
    line((point) => point.average, '#f59e0b', 1);
    line((point) => point.y, '#3b82f6', 2);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.points = [];
  }
}
