import { api } from '../../api/client';
import type { OverviewResponse } from '../../api/client';
import { OverviewStrip } from './OverviewStrip';
import { useOverview } from './useOverview';

type Props = { reload: number; response: OverviewResponse };

export function MarketOverview({ reload, response }: Props) {
  const overview = useOverview(api.overview, reload, response);

  return <OverviewStrip {...overview} />;
}
