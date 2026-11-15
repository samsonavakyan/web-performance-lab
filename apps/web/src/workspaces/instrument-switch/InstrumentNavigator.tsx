import { useState } from 'react';
import { LabSlot } from '../../lab/LabSlot';
import { Navigator } from '../../lab/variants';
import { clearResources } from './data';

export function InstrumentNavigator() {
  useState(clearResources);
  return (
    <>
      <LabSlot>
        <div className="lab-actions">
          <button onClick={clearResources} title="Forgets loaded instrument data, so the next switch loads from the network again">
            Clear data cache
          </button>
        </div>
      </LabSlot>
      <Navigator />
    </>
  );
}
