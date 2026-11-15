import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, Code2, FlaskConical, Lightbulb, MessageSquareWarning, Ruler } from 'lucide-react';

const STORAGE_KEY = 'marketlab-onboarding-done';

type Slide = { icon: ReactNode; title: string; body: ReactNode };

const SLIDES: Slide[] = [
  {
    icon: <FlaskConical size={28} />,
    title: 'A trading terminal with real problems',
    body: (
      <p>
        MarketLab looks and works like a product. Some of its screens are slow or broken in ways real apps are. You
        investigate them the way a team does: from a complaint to a fix.
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
        <p>Each case has hints in order. Open the next one only after you tried without it.</p>
        <ol className="onboarding-steps">
          <li>Reproduce</li>
          <li>Where to look</li>
          <li>What to notice</li>
          <li>Where in the code</li>
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

export function isOnboardingDone() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

type Props = { isOpen: boolean; onClose: () => void };

export function Onboarding({ isOpen, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) {
      setIndex(0);
      element.showModal();
      // showModal focuses the first button (Skip); the main action is Next.
      next.current?.focus();
    }
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* Storage may be unavailable. */
    }
    onClose();
  }

  return (
    // The native dialog traps focus and closes on Escape; onClose keeps React state in sync.
    <dialog ref={dialog} className="onboarding" aria-labelledby="onboarding-title" onClose={finish}>
      <button className="onboarding-skip" onClick={finish}>
        Skip
      </button>
      <div className="onboarding-slide" key={index}>
        <span className="onboarding-icon">{slide.icon}</span>
        <h2 id="onboarding-title">{slide.title}</h2>
        <div className="onboarding-body">{slide.body}</div>
      </div>
      <div className="onboarding-footer">
        <div className="onboarding-dots" aria-label={`Step ${index + 1} of ${SLIDES.length}`}>
          {SLIDES.map((item, i) => (
            <button
              key={item.title}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="onboarding-actions">
          {index > 0 && (
            <button className="onboarding-back" onClick={() => setIndex(index - 1)}>
              Back
            </button>
          )}
          <button ref={next} className="onboarding-next" onClick={() => (isLast ? finish() : setIndex(index + 1))}>
            {isLast ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
