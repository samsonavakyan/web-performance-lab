import type { ComponentType } from 'react';
import type { Mode, Scenario } from './cases';
import { useModes } from './modes';

type Implementations<P> = Record<Mode, ComponentType<P>>;

// Renders the implementation that matches the case mode. A mode change remounts it, so each run starts fresh.
export function variant<P extends object>(id: Scenario, implementations: Implementations<P>) {
  function Variant(props: P) {
    const mode = useModes()[id];
    const Implementation = implementations[mode];
    return <Implementation key={mode} {...props} />;
  }
  Variant.displayName = `Variant(${id})`;
  return Variant;
}
