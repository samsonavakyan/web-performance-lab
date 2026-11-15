import { useEffect, useState } from 'react';
import type { OverviewResponse } from '../../api/client';
import { startTiming } from '../../lab/timings';
import type { Overview } from '../../types';

type Load = (signal: AbortSignal, response: OverviewResponse) => Promise<Overview>;

export type OverviewState = { data: Overview | null; isPending: boolean; error: string; details: string };

// Loads the overview again on every reload or response change.
export function useOverview(load: Load, reload: number, response: OverviewResponse): OverviewState {
  const [state, setState] = useState<OverviewState>({ data: null, isPending: true, error: '', details: '' });

  useEffect(() => {
    // A newer reload or response type cancels this request; `active` also drops a result that arrives after that.
    let active = true;
    const controller = new AbortController();
    setState({ data: null, isPending: true, error: '', details: '' });
    const endTiming = startTiming('overview', 'overview');
    load(controller.signal, response)
      .then((data) => {
        if (!active) return;

        endTiming();
        setState({ data, isPending: false, error: '', details: '' });
      })
      .catch((e: Error) => {
        if (!active || e.name === 'AbortError') return;

        endTiming();
        const details = e instanceof SyntaxError ? 'Unexpected response' : e.message;
        setState({ data: null, isPending: false, error: 'Overview unavailable', details });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [load, reload, response]);

  return state;
}
