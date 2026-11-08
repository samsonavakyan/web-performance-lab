import type { Candle } from '../../types';

// Minimal canvas chart with an API similar to common chart libraries.
export class MiniChart {
  static alive = 0;
  private buffer: Float64Array;
  private closes: number[];
  private readonly onResize = () => this.draw();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    candles: Candle[],
  ) {
    MiniChart.alive += 1;
    this.closes = candles.map((candle) => candle.close);
    this.buffer = new Float64Array(150_000);
    window.addEventListener('resize', this.onResize);
    this.draw();
  }

  update(price: number) {
    this.closes = [...this.closes.slice(1), price];
    this.draw();
  }

  draw() {
    const context = this.canvas.getContext('2d');
    if (!context) return;
    const width = (this.canvas.width = this.canvas.clientWidth || 640);
    const height = (this.canvas.height = this.canvas.clientHeight || 220);
    const min = Math.min(...this.closes);
    const range = Math.max(...this.closes) - min || 1;
    this.closes.forEach((close, index) => (this.buffer[index] = close));
    context.clearRect(0, 0, width, height);
    context.strokeStyle = '#3b82f6';
    context.lineWidth = 2;
    context.beginPath();
    this.closes.forEach((close, index) => {
      const x = (index / (this.closes.length - 1)) * width;
      const y = height - ((close - min) / range) * (height - 16) - 8;
      if (index) context.lineTo(x, y);
      else context.moveTo(x, y);
    });
    context.stroke();
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.buffer = new Float64Array(0);
    MiniChart.alive -= 1;
  }
}
