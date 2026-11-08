import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Mode, Scenario } from '../types';

export type Modes = Record<Scenario, Mode>;

const STORAGE_KEY = 'marketlab-modes';

const defaultModes: Modes = {
  search: 'optimized',
  watchlist: 'optimized',
  layout: 'optimized',
  animation: 'optimized',
  shift: 'optimized',
  loading: 'optimized',
  leak: 'optimized',
  stream: 'optimized',
  navigation: 'optimized',
  export: 'optimized',
  reconnect: 'optimized',
};

function loadModes(): Modes {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Partial<Modes>;
    const result = { ...defaultModes };
    for (const key of Object.keys(defaultModes) as Scenario[]) {
      if (saved[key] === 'baseline' || saved[key] === 'optimized') result[key] = saved[key];
    }
    return result;
  } catch {
    return { ...defaultModes };
  }
}

export function useLabModes() {
  const [modes, setModes] = useState<Modes>(loadModes);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(modes));
    } catch {
      /* Storage may be unavailable. */
    }
  }, [modes]);

  const setMode = useCallback((id: Scenario, mode: Mode) => {
    setModes((previous) => ({ ...previous, [id]: mode }));
  }, []);
  return [modes, setMode] as const;
}

export const ModesContext = createContext<Modes>(defaultModes);

export function useModes() {
  return useContext(ModesContext);
}
