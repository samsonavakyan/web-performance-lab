import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Lab controls of an open case render into the side panel, outside the app itself.
let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export function setLabSlot(element: HTMLElement | null) {
  slot = element;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function LabSlot({ children }: { children: ReactNode }) {
  const target = useSyncExternalStore(subscribe, () => slot);
  return target ? createPortal(children, target) : null;
}
