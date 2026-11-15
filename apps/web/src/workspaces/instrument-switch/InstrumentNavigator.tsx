import { useState } from 'react';
import { LabSlot } from '../../lab/LabSlot';
import { Navigator } from '../../lab/variants';
import { clearPrefetched } from './prefetch';

export function InstrumentNavigator() {
  // Each run of the case starts with nothing prefetched.
  useState(clearPrefetched);
  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button onClick={clearPrefetched} title="Forgets loaded instrument data, so the next switch loads from the network again">
            Clear data cache
          </button>
        </div>
      </LabSlot>
      <Navigator />
    </>
  );
}
