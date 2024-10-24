import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks/useEntities';
import { useClient } from 'pl-fe/hooks/useClient';
import { useFeatures } from 'pl-fe/hooks/useFeatures';

import type { TrendsLink } from 'pl-api';

const useTrendingLinks = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...rest } = useEntities<TrendsLink>(
    [Entities.TRENDS_LINKS],
    () => client.trends.getTrendingLinks(),
    { enabled: features.trendingLinks },
  );

  return { trendingLinks: entities, ...rest };
};

export { useTrendingLinks };
