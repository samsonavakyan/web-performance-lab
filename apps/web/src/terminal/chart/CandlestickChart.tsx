import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { money, signed } from '../../lib/format';
import { ScannerTrack } from '../../lab/variants';
import type { Candle } from '../../types';

const HEIGHT = 345;
const LEFT = 28;
const TOP = 27;
const AXIS_FONT_SIZE = 12;
const PRICE_MARKER_HEIGHT = 22;
const PLOT_HEIGHT = 233;
const SESSION_START = 8;
const SESSION_HOURS = 8;

type Props = {
  candles: Candle[];
  symbol: string;
  interval: string;
  change: number;
};

export function CandlestickChart({ candles, symbol, interval, change }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(970);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const updateWidth = () => setWidth(Math.max(240, svg.getBoundingClientRect().width));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(svg);

    return () => observer.disconnect();
  }, []);
  const view = interval === '1D' ? candles.slice(-55) : interval === '1W' ? candles.slice(-100) : candles;
  const high = (view.length ? Math.max(...view.map((c) => c.high)) : 1) * 1.003;
  const low = (view.length ? Math.min(...view.map((c) => c.low)) : 0) * 0.997;
  const valueY = (v: number) => TOP + ((high - v) / (high - low)) * PLOT_HEIGHT;
  const current = view[view.length - 1];
  const maxVolume = Math.max(...view.map((c) => c.volume), 1);
  const ticks = Array.from({ length: 6 }, (_, index) => ({
    y: TOP + (index * PLOT_HEIGHT) / 5,
    label: money(high - (index / 5) * (high - low)),
  }));
  const closeLabel = current ? money(current.close) : '';
  const axisWidth = Math.max(
    96,
    ...[closeLabel, ...ticks.map((tick) => tick.label)].map((label) => label.length * AXIS_FONT_SIZE * 0.6 + 16),
  );
  const axisLeft = width - axisWidth - 8;
  const plotRight = axisLeft - 12;
  const plotWidth = plotRight - LEFT;
  const step = plotWidth / Math.max(view.length, 1);
  const closeY = current ? valueY(current.close) : null;
  // The axis spans 08:00–16:00; ticks fall on whole hours, as often as the width allows.
  const hourStep = [1, 2, 4].find((step) => plotWidth / (SESSION_HOURS / step) >= 70) ?? 8;
  const timeTickCount = SESSION_HOURS / hourStep + 1;
  const labelGap = PRICE_MARKER_HEIGHT / 2 + AXIS_FONT_SIZE / 2 + 4;

  return (
    <div className="chart-wrap">
      <div className="chart-info">
        <div className="small-label">
          {symbol} / USD <span>•</span> LAST CLOSE
        </div>
        <div className="chart-number">
          {current ? money(current.close) : '—'}
          <span className={change >= 0 ? 'txt-up' : 'txt-down'}>
            {signed(change)} {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </span>
        </div>
        <div className="ohlc">
          O <b>{money(current?.open ?? 0)}</b> &nbsp; H <b>{money(current?.high ?? 0)}</b> &nbsp; L{' '}
          <b>{money(current?.low ?? 0)}</b> &nbsp; C <b>{money(current?.close ?? 0)}</b>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="candle-svg"
        role="img"
        aria-label={`${symbol} price chart`}
      >
        {ticks.map(({ y, label }) => (
          <g key={label}>
            <line x1={LEFT} y1={y} x2={plotRight} y2={y} className="grid-line" />
            {(closeY === null || Math.abs(y - closeY) > labelGap) && (
              <text
                x={width - 16}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="axis-label price-axis-label"
              >
                {label}
              </text>
            )}
          </g>
        ))}
        {Array.from({ length: timeTickCount }, (_, i) => {
          const x = LEFT + i * (plotWidth / (timeTickCount - 1));

          return (
            <g key={i}>
              <line x1={x} y1={TOP} x2={x} y2="320" className="grid-line" />
              <text x={x} y="335" textAnchor="middle" className="axis-label">
                {String(SESSION_START + i * hourStep).padStart(2, '0')}:00
              </text>
            </g>
          );
        })}
        {view.map((c, i) => {
          const x = LEFT + i * step + step / 2;
          const yOpen = valueY(c.open);
          const yClose = valueY(c.close);
          const color = c.close >= c.open ? '#089981' : '#f23645';
          const bodyWidth = Math.max(0.75, step * 0.58);
          const volumeHeight = (c.volume / maxVolume) * 56;

          return (
            <g key={`${interval}-${i}`}>
              <line x1={x} x2={x} y1={valueY(c.high)} y2={valueY(c.low)} stroke={color} strokeWidth="1.25" />
              <rect
                x={x - bodyWidth / 2}
                y={Math.min(yOpen, yClose)}
                width={bodyWidth}
                height={Math.max(1.35, Math.abs(yOpen - yClose))}
                fill={color}
                rx=".25"
              />
              <rect
                x={x - bodyWidth / 2}
                y={319 - volumeHeight}
                width={bodyWidth}
                height={volumeHeight}
                fill={color}
                opacity=".23"
              />
            </g>
          );
        })}
        {closeY !== null && (
          <g className="last-price-marker">
            <line
              x1={LEFT}
              y1={closeY}
              x2={axisLeft}
              y2={closeY}
              stroke="#089981"
              strokeWidth=".75"
              strokeDasharray="4 5"
            />
            <rect
              x={axisLeft}
              y={closeY - PRICE_MARKER_HEIGHT / 2}
              width={axisWidth}
              height={PRICE_MARKER_HEIGHT}
              rx="3"
              fill="#089981"
            />
            <text x={width - 16} y={closeY} textAnchor="end" dominantBaseline="middle" className="last-price">
              {closeLabel}
            </text>
          </g>
        )}
      </svg>

      <ScannerTrack />
    </div>
  );
}
