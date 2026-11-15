import { useEffect, useRef, useState } from 'react';
import { SLIDES } from './onboardingSlides';

const STORAGE_KEY = 'marketlab-onboarding-done';

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
