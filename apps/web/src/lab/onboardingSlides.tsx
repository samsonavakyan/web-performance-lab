import type { ReactNode } from 'react';
import { Activity, Code2, FlaskConical, Lightbulb, MessageSquareWarning, Ruler } from 'lucide-react';

// Slides of the guide shown on the first visit and from the ? button.
export type Slide = { icon: ReactNode; title: string; body: ReactNode };

export const SLIDES: Slide[] = [
  {
    icon: <FlaskConical size={28} />,
    title: 'A trading terminal with real problems',
    body: (
      <p>
        MarketLab looks and works like a product. Some of its screens are slow or broken the way real apps are. You
        investigate them like a team would, starting from a complaint and ending with a fix.
      </p>
    ),
  },
  {
    icon: <MessageSquareWarning size={28} />,
    title: 'Start from the complaint',
    body: (
      <p>
        Pick a case in the Performance Lab panel and switch it to <b>Baseline</b>, the version with the problem. You
        only get what users or the team report. Try to reproduce it on your own first.
      </p>
    ),
  },
  {
    icon: <Activity size={28} />,
    title: 'Measure, do not guess',
    body: (
      <ul>
        <li>Record the same steps in Chrome DevTools in Baseline and Optimized.</li>
        <li>Use the same CPU and network throttling for both. 4x CPU makes differences visible.</li>
        <li>Keep the other cases on Optimized so their noise stays out of your traces.</li>
      </ul>
    ),
  },
  {
    icon: <Lightbulb size={28} />,
    title: 'Open hints only when stuck',
    body: (
      <>
        <p>Each case has hints in order. Open the next one only after you have tried without it.</p>
        <ol className="onboarding-steps">
          <li>Reproduce</li>
          <li>Where to look</li>
          <li>What to notice</li>
          <li>Solution</li>
        </ol>
      </>
    ),
  },
  {
    icon: <Ruler size={28} />,
    title: 'Timings point at the code',
    body: (
      <p>
        Some cases have a <b>Timings</b> switch. It adds measures to the Timings track of the Performance panel. It
        shows where the time goes, so turn it on after your first look, not before.
      </p>
    ),
  },
  {
    icon: <Code2 size={28} />,
    title: 'Compare the two versions',
    body: (
      <p>
        Every case has two files side by side: <code>X.baseline.tsx</code> with the problem and <code>X.tsx</code> with
        the fix. Once you know the cause, diff the pair and check that the fix is what you would have written.
      </p>
    ),
  },
];
